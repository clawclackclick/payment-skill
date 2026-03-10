/**
 * Payment Skill - Bunq API Client
 *
 * Handles all Bunq API interactions
 */
import { BunqConfig } from '../types';
export declare class BunqClient {
    private client;
    private config;
    private baseURL;
    constructor(config: BunqConfig);
    private generateRequestId;
    getUser(userId: string): Promise<any>;
    getMonetaryAccounts(userId: string): Promise<any>;
    getMonetaryAccount(userId: string, accountId: string): Promise<any>;
    getAccountBalance(userId: string, accountId: string): Promise<any>;
    createPayment(userId: string, accountId: string, amount: string, currency: string, counterpartyIban: string, counterpartyName: string, description: string): Promise<any>;
    getPayments(userId: string, accountId: string, limit?: number): Promise<any>;
    getPayment(userId: string, accountId: string, paymentId: string): Promise<any>;
    createRequestInquiry(userId: string, accountId: string, amount: string, currency: string, counterpartyAlias: any, description: string, allowBunqme?: boolean): Promise<any>;
    getRequestInquiries(userId: string, accountId: string): Promise<any>;
    getRequestInquiry(userId: string, accountId: string, inquiryId: string): Promise<any>;
    cancelRequestInquiry(userId: string, accountId: string, inquiryId: string): Promise<any>;
    createDraftPayment(userId: string, accountId: string, payments: any[]): Promise<any>;
    getDraftPayments(userId: string, accountId: string): Promise<any>;
    deleteDraftPayment(userId: string, accountId: string, draftId: string): Promise<any>;
    createCounterparty(userId: string, name: string, type: string, value: string): Promise<any>;
    getCounterparties(userId: string): Promise<any>;
    createSchedule(userId: string, accountId: string, payment: any, schedule: any): Promise<any>;
    getSchedules(userId: string, accountId: string): Promise<any>;
    deleteSchedule(userId: string, accountId: string, scheduleId: string): Promise<any>;
    getCards(userId: string): Promise<any>;
    exportStatement(userId: string, accountId: string, dateStart: string, dateEnd: string, format?: 'CSV' | 'PDF' | 'MT940'): Promise<any>;
}
//# sourceMappingURL=bunq.d.ts.map