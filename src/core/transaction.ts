/**
 * Payment Skill - Transaction Manager
 * 
 * Manages all transactions, their states, and lifecycle
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { Transaction, TransactionStatus } from '../types';
import { configManager } from './config';

// Support both old location (~/.payment-skill) and new location (./data)
const OLD_DATA_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.payment-skill');
const NEW_DATA_DIR = path.join(__dirname, '..', '..', 'data');

// Use new location if it exists and has config, otherwise fall back to old location
const DATA_DIR = fs.existsSync(path.join(NEW_DATA_DIR, 'config.json'))
  ? NEW_DATA_DIR
  : (fs.existsSync(OLD_DATA_DIR) ? OLD_DATA_DIR : NEW_DATA_DIR);

const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

export class TransactionManager {
  private transactions: Map<string, Transaction> = new Map();

  constructor() {
    this.loadTransactions();
  }

  private loadTransactions(): void {
    if (fs.existsSync(TRANSACTIONS_FILE)) {
      const data = fs.readJsonSync(TRANSACTIONS_FILE);
      Object.entries(data).forEach(([id, tx]: [string, any]) => {
        this.transactions.set(id, {
          ...tx,
          createdAt: new Date(tx.createdAt),
          updatedAt: new Date(tx.updatedAt)
        });
      });
    }
  }

  private saveTransactions(): void {
    const data: Record<string, Transaction> = {};
    this.transactions.forEach((tx, id) => {
      data[id] = tx;
    });
    fs.writeJsonSync(TRANSACTIONS_FILE, data, { spaces: 2 });
  }

  createTransaction(
    provider: string,
    merchant: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Transaction {
    // Check emergency stop
    if (configManager.isEmergencyStopActive()) {
      throw new Error('Emergency stop is active. Cannot create new transactions.');
    }

    // Check limits
    this.checkLimits(amount, currency);

    const transaction: Transaction = {
      id: this.generateTransactionId(),
      provider,
      merchant,
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata
    };

    this.transactions.set(transaction.id, transaction);
    this.saveTransactions();

    return transaction;
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private checkLimits(amount: number, currency: string): void {
    const limits = configManager.getLimits();
    
    // Check per-transaction limit
    if (amount > limits.perTransaction) {
      throw new Error(`Amount ${amount} exceeds per-transaction limit of ${limits.perTransaction}`);
    }

    // Check daily limit
    const today = new Date().toDateString();
    const dailyTotal = this.getDailyTotal(today);
    if (dailyTotal + amount > limits.daily) {
      throw new Error(`Daily limit of ${limits.daily} would be exceeded`);
    }

    // Check hourly transaction count
    const hourlyCount = this.getHourlyTransactionCount();
    if (hourlyCount >= limits.maxTransactionsPerHour) {
      throw new Error(`Hourly transaction limit of ${limits.maxTransactionsPerHour} reached`);
    }

    // Check time window
    const timeWindow = configManager.getTimeWindow();
    if (timeWindow.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime < timeWindow.start || currentTime > timeWindow.end) {
        throw new Error(`Transactions not allowed outside time window ${timeWindow.start}-${timeWindow.end}`);
      }
    }
  }

  private getDailyTotal(date: string): number {
    let total = 0;
    this.transactions.forEach(tx => {
      if (tx.createdAt.toDateString() === date && 
          (tx.status === 'completed' || tx.status === 'processing')) {
        total += tx.amount;
      }
    });
    return total;
  }

  private getHourlyTransactionCount(): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let count = 0;
    this.transactions.forEach(tx => {
      if (tx.createdAt > oneHourAgo && 
          (tx.status === 'pending' || tx.status === 'processing' || tx.status === 'completed')) {
        count++;
      }
    });
    return count;
  }

  updateTransactionStatus(
    transactionId: string, 
    status: TransactionStatus, 
    error?: string
  ): Transaction {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    // If emergency stop is active, only allow cancellation
    if (configManager.isEmergencyStopActive() && status !== 'cancelled') {
      throw new Error('Emergency stop is active. Only cancellation allowed.');
    }

    tx.status = status;
    tx.updatedAt = new Date();
    if (error) {
      tx.error = error;
    }

    this.transactions.set(transactionId, tx);
    this.saveTransactions();

    // Update emergency stop pending list
    if (status === 'processing') {
      configManager.addPendingTransaction(transactionId);
    } else if (['completed', 'failed', 'cancelled'].includes(status)) {
      configManager.removePendingTransaction(transactionId);
    }

    return tx;
  }

  getTransaction(transactionId: string): Transaction | null {
    return this.transactions.get(transactionId) || null;
  }

  getTransactions(
    filters?: {
      status?: TransactionStatus;
      provider?: string;
      merchant?: string;
      from?: Date;
      to?: Date;
    }
  ): Transaction[] {
    let txs = Array.from(this.transactions.values());

    if (filters?.status) {
      txs = txs.filter(tx => tx.status === filters.status);
    }
    if (filters?.provider) {
      txs = txs.filter(tx => tx.provider === filters.provider);
    }
    if (filters?.merchant) {
      txs = txs.filter(tx => tx.merchant === filters.merchant);
    }
    if (filters?.from) {
      txs = txs.filter(tx => tx.createdAt >= filters.from!);
    }
    if (filters?.to) {
      txs = txs.filter(tx => tx.createdAt <= filters.to!);
    }

    return txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getPendingTransactions(): Transaction[] {
    return this.getTransactions({ status: 'pending' });
  }

  cancelAllPending(): number {
    let count = 0;
    this.transactions.forEach((tx, id) => {
      if (tx.status === 'pending' || tx.status === 'processing') {
        this.updateTransactionStatus(id, 'cancelled', 'Cancelled by emergency stop');
        count++;
      }
    });
    return count;
  }

  deleteTransaction(transactionId: string): boolean {
    const deleted = this.transactions.delete(transactionId);
    if (deleted) {
      this.saveTransactions();
    }
    return deleted;
  }
}

export const transactionManager = new TransactionManager();