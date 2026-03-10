"use strict";
/**
 * Payment Skill - Transaction Manager
 *
 * Manages all transactions, their states, and lifecycle
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionManager = exports.TransactionManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const DATA_DIR = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.payment-skill');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
class TransactionManager {
    constructor() {
        this.transactions = new Map();
        this.loadTransactions();
    }
    loadTransactions() {
        if (fs.existsSync(TRANSACTIONS_FILE)) {
            const data = fs.readJsonSync(TRANSACTIONS_FILE);
            Object.entries(data).forEach(([id, tx]) => {
                this.transactions.set(id, {
                    ...tx,
                    createdAt: new Date(tx.createdAt),
                    updatedAt: new Date(tx.updatedAt)
                });
            });
        }
    }
    saveTransactions() {
        const data = {};
        this.transactions.forEach((tx, id) => {
            data[id] = tx;
        });
        fs.writeJsonSync(TRANSACTIONS_FILE, data, { spaces: 2 });
    }
    createTransaction(provider, merchant, amount, currency, metadata) {
        // Check emergency stop
        if (config_1.configManager.isEmergencyStopActive()) {
            throw new Error('Emergency stop is active. Cannot create new transactions.');
        }
        // Check limits
        this.checkLimits(amount, currency);
        const transaction = {
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
    generateTransactionId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    checkLimits(amount, currency) {
        const limits = config_1.configManager.getLimits();
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
        const timeWindow = config_1.configManager.getTimeWindow();
        if (timeWindow.enabled) {
            const now = new Date();
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            if (currentTime < timeWindow.start || currentTime > timeWindow.end) {
                throw new Error(`Transactions not allowed outside time window ${timeWindow.start}-${timeWindow.end}`);
            }
        }
    }
    getDailyTotal(date) {
        let total = 0;
        this.transactions.forEach(tx => {
            if (tx.createdAt.toDateString() === date &&
                (tx.status === 'completed' || tx.status === 'processing')) {
                total += tx.amount;
            }
        });
        return total;
    }
    getHourlyTransactionCount() {
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
    updateTransactionStatus(transactionId, status, error) {
        const tx = this.transactions.get(transactionId);
        if (!tx) {
            throw new Error(`Transaction ${transactionId} not found`);
        }
        // If emergency stop is active, only allow cancellation
        if (config_1.configManager.isEmergencyStopActive() && status !== 'cancelled') {
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
            config_1.configManager.addPendingTransaction(transactionId);
        }
        else if (['completed', 'failed', 'cancelled'].includes(status)) {
            config_1.configManager.removePendingTransaction(transactionId);
        }
        return tx;
    }
    getTransaction(transactionId) {
        return this.transactions.get(transactionId) || null;
    }
    getTransactions(filters) {
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
            txs = txs.filter(tx => tx.createdAt >= filters.from);
        }
        if (filters?.to) {
            txs = txs.filter(tx => tx.createdAt <= filters.to);
        }
        return txs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    getPendingTransactions() {
        return this.getTransactions({ status: 'pending' });
    }
    cancelAllPending() {
        let count = 0;
        this.transactions.forEach((tx, id) => {
            if (tx.status === 'pending' || tx.status === 'processing') {
                this.updateTransactionStatus(id, 'cancelled', 'Cancelled by emergency stop');
                count++;
            }
        });
        return count;
    }
    deleteTransaction(transactionId) {
        const deleted = this.transactions.delete(transactionId);
        if (deleted) {
            this.saveTransactions();
        }
        return deleted;
    }
}
exports.TransactionManager = TransactionManager;
exports.transactionManager = new TransactionManager();
//# sourceMappingURL=transaction.js.map