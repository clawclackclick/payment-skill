/**
 * Payment Skill - Main Entry Point
 *
 * Exports all modules for programmatic use
 */
export { WiseClient } from './api/wise';
export { BunqClient } from './api/bunq';
export { ConfigManager, configManager } from './core/config';
export { TransactionManager, transactionManager } from './core/transaction';
export * from './types';
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map