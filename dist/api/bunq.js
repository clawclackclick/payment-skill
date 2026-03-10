"use strict";
/**
 * Payment Skill - Bunq API Client
 *
 * Handles all Bunq API interactions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BunqClient = void 0;
const axios_1 = __importDefault(require("axios"));
class BunqClient {
    constructor(config) {
        this.config = config;
        this.baseURL = 'https://api.bunq.com/v1';
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                'X-Bunq-Client-Request-Id': this.generateRequestId(),
                'X-Bunq-Geolocation': '0 0 0 0 NL',
                'X-Bunq-Language': 'en_US',
                'X-Bunq-Region': 'en_US',
                'Content-Type': 'application/json'
            }
        });
        // Add API key to requests
        this.client.interceptors.request.use((config) => {
            config.headers['X-Bunq-Client-Authentication'] = this.config.apiKey;
            return config;
        });
    }
    generateRequestId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // User Management
    async getUser(userId) {
        const response = await this.client.get(`/user/${userId}`);
        return response.data;
    }
    // Monetary Accounts
    async getMonetaryAccounts(userId) {
        const response = await this.client.get(`/user/${userId}/monetary-account`);
        return response.data;
    }
    async getMonetaryAccount(userId, accountId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}`);
        return response.data;
    }
    async getAccountBalance(userId, accountId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}`);
        return response.data;
    }
    // Payments
    async createPayment(userId, accountId, amount, currency, counterpartyIban, counterpartyName, description) {
        const response = await this.client.post(`/user/${userId}/monetary-account/${accountId}/payment`, {
            amount: {
                value: amount,
                currency: currency
            },
            counterparty_alias: {
                type: 'IBAN',
                value: counterpartyIban,
                name: counterpartyName
            },
            description: description
        });
        return response.data;
    }
    async getPayments(userId, accountId, limit = 100) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}/payment?count=${limit}`);
        return response.data;
    }
    async getPayment(userId, accountId, paymentId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}/payment/${paymentId}`);
        return response.data;
    }
    // Request Inquiries (Payment Requests)
    async createRequestInquiry(userId, accountId, amount, currency, counterpartyAlias, description, allowBunqme = false) {
        const response = await this.client.post(`/user/${userId}/monetary-account/${accountId}/request-inquiry`, {
            amount_inquired: {
                value: amount,
                currency: currency
            },
            counterparty_alias: counterpartyAlias,
            description: description,
            allow_bunqme: allowBunqme
        });
        return response.data;
    }
    async getRequestInquiries(userId, accountId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}/request-inquiry`);
        return response.data;
    }
    async getRequestInquiry(userId, accountId, inquiryId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}/request-inquiry/${inquiryId}`);
        return response.data;
    }
    async cancelRequestInquiry(userId, accountId, inquiryId) {
        const response = await this.client.put(`/user/${userId}/monetary-account/${accountId}/request-inquiry/${inquiryId}`, { status: 'CANCELLED' });
        return response.data;
    }
    // Draft Payments
    async createDraftPayment(userId, accountId, payments) {
        const response = await this.client.post(`/user/${userId}/monetary-account/${accountId}/draft-payment`, { payments });
        return response.data;
    }
    async getDraftPayments(userId, accountId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}/draft-payment`);
        return response.data;
    }
    async deleteDraftPayment(userId, accountId, draftId) {
        const response = await this.client.delete(`/user/${userId}/monetary-account/${accountId}/draft-payment/${draftId}`);
        return response.data;
    }
    // Counterparties
    async createCounterparty(userId, name, type, value) {
        const response = await this.client.post(`/user/${userId}/counterparty`, {
            name,
            alias: {
                type,
                value,
                name
            }
        });
        return response.data;
    }
    async getCounterparties(userId) {
        const response = await this.client.get(`/user/${userId}/counterparty`);
        return response.data;
    }
    // Schedules (Recurring Payments)
    async createSchedule(userId, accountId, payment, schedule) {
        const response = await this.client.post(`/user/${userId}/monetary-account/${accountId}/schedule`, {
            payment,
            schedule
        });
        return response.data;
    }
    async getSchedules(userId, accountId) {
        const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}/schedule`);
        return response.data;
    }
    async deleteSchedule(userId, accountId, scheduleId) {
        const response = await this.client.delete(`/user/${userId}/monetary-account/${accountId}/schedule/${scheduleId}`);
        return response.data;
    }
    // Cards
    async getCards(userId) {
        const response = await this.client.get(`/user/${userId}/card`);
        return response.data;
    }
    // Export
    async exportStatement(userId, accountId, dateStart, dateEnd, format = 'CSV') {
        const response = await this.client.post(`/user/${userId}/monetary-account/${accountId}/export-statement`, {
            date_start: dateStart,
            date_end: dateEnd,
            regional_format: format
        });
        return response.data;
    }
}
exports.BunqClient = BunqClient;
//# sourceMappingURL=bunq.js.map