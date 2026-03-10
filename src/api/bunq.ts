/**
 * Payment Skill - Bunq API Client
 * 
 * Handles all Bunq API interactions
 */

import axios, { AxiosInstance } from 'axios';
import { BunqConfig } from '../types';

export class BunqClient {
  private client: AxiosInstance;
  private config: BunqConfig;
  private baseURL: string;

  constructor(config: BunqConfig) {
    this.config = config;
    this.baseURL = 'https://api.bunq.com/v1';
    
    this.client = axios.create({
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

  private generateRequestId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // User Management
  async getUser(userId: string) {
    const response = await this.client.get(`/user/${userId}`);
    return response.data;
  }

  // Monetary Accounts
  async getMonetaryAccounts(userId: string) {
    const response = await this.client.get(`/user/${userId}/monetary-account`);
    return response.data;
  }

  async getMonetaryAccount(userId: string, accountId: string) {
    const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}`);
    return response.data;
  }

  async getAccountBalance(userId: string, accountId: string) {
    const response = await this.client.get(`/user/${userId}/monetary-account/${accountId}`);
    return response.data;
  }

  // Payments
  async createPayment(
    userId: string,
    accountId: string,
    amount: string,
    currency: string,
    counterpartyIban: string,
    counterpartyName: string,
    description: string
  ) {
    const response = await this.client.post(
      `/user/${userId}/monetary-account/${accountId}/payment`,
      {
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
      }
    );
    return response.data;
  }

  async getPayments(userId: string, accountId: string, limit: number = 100) {
    const response = await this.client.get(
      `/user/${userId}/monetary-account/${accountId}/payment?count=${limit}`
    );
    return response.data;
  }

  async getPayment(userId: string, accountId: string, paymentId: string) {
    const response = await this.client.get(
      `/user/${userId}/monetary-account/${accountId}/payment/${paymentId}`
    );
    return response.data;
  }

  // Request Inquiries (Payment Requests)
  async createRequestInquiry(
    userId: string,
    accountId: string,
    amount: string,
    currency: string,
    counterpartyAlias: any,
    description: string,
    allowBunqme: boolean = false
  ) {
    const response = await this.client.post(
      `/user/${userId}/monetary-account/${accountId}/request-inquiry`,
      {
        amount_inquired: {
          value: amount,
          currency: currency
        },
        counterparty_alias: counterpartyAlias,
        description: description,
        allow_bunqme: allowBunqme
      }
    );
    return response.data;
  }

  async getRequestInquiries(userId: string, accountId: string) {
    const response = await this.client.get(
      `/user/${userId}/monetary-account/${accountId}/request-inquiry`
    );
    return response.data;
  }

  async getRequestInquiry(userId: string, accountId: string, inquiryId: string) {
    const response = await this.client.get(
      `/user/${userId}/monetary-account/${accountId}/request-inquiry/${inquiryId}`
    );
    return response.data;
  }

  async cancelRequestInquiry(userId: string, accountId: string, inquiryId: string) {
    const response = await this.client.put(
      `/user/${userId}/monetary-account/${accountId}/request-inquiry/${inquiryId}`,
      { status: 'CANCELLED' }
    );
    return response.data;
  }

  // Draft Payments
  async createDraftPayment(
    userId: string,
    accountId: string,
    payments: any[]
  ) {
    const response = await this.client.post(
      `/user/${userId}/monetary-account/${accountId}/draft-payment`,
      { payments }
    );
    return response.data;
  }

  async getDraftPayments(userId: string, accountId: string) {
    const response = await this.client.get(
      `/user/${userId}/monetary-account/${accountId}/draft-payment`
    );
    return response.data;
  }

  async deleteDraftPayment(userId: string, accountId: string, draftId: string) {
    const response = await this.client.delete(
      `/user/${userId}/monetary-account/${accountId}/draft-payment/${draftId}`
    );
    return response.data;
  }

  // Counterparties
  async createCounterparty(
    userId: string,
    name: string,
    type: string,
    value: string
  ) {
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

  async getCounterparties(userId: string) {
    const response = await this.client.get(`/user/${userId}/counterparty`);
    return response.data;
  }

  // Schedules (Recurring Payments)
  async createSchedule(
    userId: string,
    accountId: string,
    payment: any,
    schedule: any
  ) {
    const response = await this.client.post(
      `/user/${userId}/monetary-account/${accountId}/schedule`,
      {
        payment,
        schedule
      }
    );
    return response.data;
  }

  async getSchedules(userId: string, accountId: string) {
    const response = await this.client.get(
      `/user/${userId}/monetary-account/${accountId}/schedule`
    );
    return response.data;
  }

  async deleteSchedule(userId: string, accountId: string, scheduleId: string) {
    const response = await this.client.delete(
      `/user/${userId}/monetary-account/${accountId}/schedule/${scheduleId}`
    );
    return response.data;
  }

  // Cards
  async getCards(userId: string) {
    const response = await this.client.get(`/user/${userId}/card`);
    return response.data;
  }

  // Export
  async exportStatement(
    userId: string,
    accountId: string,
    dateStart: string,
    dateEnd: string,
    format: 'CSV' | 'PDF' | 'MT940' = 'CSV'
  ) {
    const response = await this.client.post(
      `/user/${userId}/monetary-account/${accountId}/export-statement`,
      {
        date_start: dateStart,
        date_end: dateEnd,
        regional_format: format
      }
    );
    return response.data;
  }
}