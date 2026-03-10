/**
 * Payment Skill - Transaction Manager
 *
 * Manages all transactions, their states, and lifecycle
 */
import { Transaction, TransactionStatus } from '../types';
export declare class TransactionManager {
    private transactions;
    constructor();
    private loadTransactions;
    private saveTransactions;
    createTransaction(provider: string, merchant: string, amount: number, currency: string, metadata?: Record<string, any>): Transaction;
    private generateTransactionId;
    private checkLimits;
    private getDailyTotal;
    private getHourlyTransactionCount;
    updateTransactionStatus(transactionId: string, status: TransactionStatus, error?: string): Transaction;
    getTransaction(transactionId: string): Transaction | null;
    getTransactions(filters?: {
        status?: TransactionStatus;
        provider?: string;
        merchant?: string;
        from?: Date;
        to?: Date;
    }): Transaction[];
    getPendingTransactions(): Transaction[];
    cancelAllPending(): number;
    deleteTransaction(transactionId: string): boolean;
}
export declare const transactionManager: TransactionManager;
//# sourceMappingURL=transaction.d.ts.map