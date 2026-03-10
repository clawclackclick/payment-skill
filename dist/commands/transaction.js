"use strict";
/**
 * Payment Skill - Transaction Commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const transaction_1 = require("../core/transaction");
exports.transactionCommands = new commander_1.Command('transaction')
    .description('Manage transactions');
exports.transactionCommands
    .command('list')
    .description('List transactions')
    .option('-s, --status <status>', 'Filter by status')
    .option('-p, --provider <provider>', 'Filter by provider')
    .option('-m, --merchant <merchant>', 'Filter by merchant')
    .option('--from <date>', 'From date (YYYY-MM-DD)')
    .option('--to <date>', 'To date (YYYY-MM-DD)')
    .action((options) => {
    const filters = {};
    if (options.status)
        filters.status = options.status;
    if (options.provider)
        filters.provider = options.provider;
    if (options.merchant)
        filters.merchant = options.merchant;
    if (options.from)
        filters.from = new Date(options.from);
    if (options.to)
        filters.to = new Date(options.to);
    const txs = transaction_1.transactionManager.getTransactions(filters);
    console.log(chalk_1.default.blue(`Transactions (${txs.length}):`));
    txs.forEach(tx => {
        const statusColor = tx.status === 'completed' ? chalk_1.default.green :
            tx.status === 'pending' ? chalk_1.default.yellow : chalk_1.default.red;
        console.log(`  ${tx.id} - ${statusColor(tx.status)} - ${tx.amount} ${tx.currency} - ${tx.merchant}`);
    });
});
exports.transactionCommands
    .command('get')
    .description('Get transaction details')
    .argument('<id>', 'Transaction ID')
    .action((id) => {
    const tx = transaction_1.transactionManager.getTransaction(id);
    if (tx) {
        console.log(JSON.stringify(tx, null, 2));
    }
    else {
        console.log(chalk_1.default.yellow(`Transaction '${id}' not found`));
    }
});
exports.transactionCommands
    .command('cancel')
    .description('Cancel a transaction')
    .argument('<id>', 'Transaction ID')
    .action((id) => {
    transaction_1.transactionManager.updateTransactionStatus(id, 'cancelled');
    console.log(chalk_1.default.green(`✓ Transaction ${id} cancelled`));
});
exports.transactionCommands
    .command('delete')
    .description('Delete a transaction')
    .argument('<id>', 'Transaction ID')
    .action((id) => {
    transaction_1.transactionManager.deleteTransaction(id);
    console.log(chalk_1.default.green(`✓ Transaction ${id} deleted`));
});
//# sourceMappingURL=transaction.js.map