"use strict";
/**
 * Payment Skill - Bunq Commands
 *
 * Bunq API CLI commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bunqCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const bunq_1 = require("../api/bunq");
const config_1 = require("../core/config");
const transaction_1 = require("../core/transaction");
exports.bunqCommands = new commander_1.Command('bunq')
    .description('Bunq API operations');
// List accounts
exports.bunqCommands
    .command('accounts')
    .description('List monetary accounts')
    .requiredOption('-u, --user <id>', 'User ID')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Fetching accounts...').start();
    try {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured. Run: payment-skill provider add bunq');
        }
        const client = new bunq_1.BunqClient(config);
        const accounts = await client.getMonetaryAccounts(options.user);
        spinner.stop();
        console.log(chalk_1.default.blue('Monetary Accounts:'));
        accounts.forEach((acc) => {
            console.log(`  ${acc.id} - ${acc.description} - ${acc.balance.value} ${acc.balance.currency}`);
        });
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Get balance
exports.bunqCommands
    .command('balance')
    .description('Get account balance')
    .requiredOption('-u, --user <id>', 'User ID')
    .requiredOption('-a, --account <id>', 'Account ID')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Fetching balance...').start();
    try {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured');
        }
        const client = new bunq_1.BunqClient(config);
        const account = await client.getMonetaryAccount(options.user, options.account);
        spinner.stop();
        console.log(chalk_1.default.blue('Account Balance:'));
        console.log(`  ${account.balance.value} ${account.balance.currency}`);
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Create payment
exports.bunqCommands
    .command('pay')
    .description('Create a payment')
    .requiredOption('-u, --user <id>', 'User ID')
    .requiredOption('-a, --account <id>', 'Account ID')
    .requiredOption('--amount <amount>', 'Payment amount')
    .requiredOption('--currency <currency>', 'Currency (e.g., EUR)')
    .requiredOption('--to-iban <iban>', 'Recipient IBAN')
    .requiredOption('--to-name <name>', 'Recipient name')
    .requiredOption('--description <text>', 'Payment description')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Creating payment...').start();
    try {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured');
        }
        // Create transaction record
        const tx = transaction_1.transactionManager.createTransaction('bunq', 'bunq-payment', parseFloat(options.amount), options.currency, { toIban: options.toIban, description: options.description });
        const client = new bunq_1.BunqClient(config);
        const payment = await client.createPayment(options.user, options.account, options.amount, options.currency, options.toIban, options.toName, options.description);
        transaction_1.transactionManager.updateTransactionStatus(tx.id, 'completed');
        spinner.succeed(chalk_1.default.green('Payment created'));
        console.log(`  Transaction ID: ${tx.id}`);
        console.log(`  Payment ID: ${payment.id}`);
        console.log(`  Status: ${payment.status}`);
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Create payment request
exports.bunqCommands
    .command('request')
    .description('Create a payment request (RequestInquiry)')
    .requiredOption('-u, --user <id>', 'User ID')
    .requiredOption('-a, --account <id>', 'Account ID')
    .requiredOption('--amount <amount>', 'Request amount')
    .requiredOption('--currency <currency>', 'Currency')
    .requiredOption('--to <alias>', 'Counterparty alias (email/phone/IBAN)')
    .requiredOption('--description <text>', 'Request description')
    .option('--type <type>', 'Alias type (EMAIL/PHONE/IBAN)', 'EMAIL')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Creating payment request...').start();
    try {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured');
        }
        const client = new bunq_1.BunqClient(config);
        const request = await client.createRequestInquiry(options.user, options.account, options.amount, options.currency, {
            type: options.type,
            value: options.to,
            name: options.to
        }, options.description);
        spinner.succeed(chalk_1.default.green('Payment request created'));
        console.log(`  Request ID: ${request.id}`);
        console.log(`  Status: ${request.status}`);
        console.log(chalk_1.default.yellow('  Waiting for recipient to accept...'));
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// List payments
exports.bunqCommands
    .command('payments')
    .description('List payments')
    .requiredOption('-u, --user <id>', 'User ID')
    .requiredOption('-a, --account <id>', 'Account ID')
    .option('-l, --limit <number>', 'Limit results', '10')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Fetching payments...').start();
    try {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured');
        }
        const client = new bunq_1.BunqClient(config);
        const payments = await client.getPayments(options.user, options.account, parseInt(options.limit));
        spinner.stop();
        console.log(chalk_1.default.blue(`Payments (${payments.length}):`));
        payments.forEach((p) => {
            const direction = p.amount.value.startsWith('-') ? 'OUT' : 'IN';
            const color = direction === 'OUT' ? chalk_1.default.red : chalk_1.default.green;
            console.log(`  ${p.id} - ${color(direction)} - ${p.amount.value} ${p.amount.currency} - ${p.description}`);
        });
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// List requests
exports.bunqCommands
    .command('requests')
    .description('List payment requests')
    .requiredOption('-u, --user <id>', 'User ID')
    .requiredOption('-a, --account <id>', 'Account ID')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Fetching requests...').start();
    try {
        const config = config_1.configManager.getProvider('bunq');
        if (!config) {
            throw new Error('Bunq not configured');
        }
        const client = new bunq_1.BunqClient(config);
        const requests = await client.getRequestInquiries(options.user, options.account);
        spinner.stop();
        console.log(chalk_1.default.blue(`Payment Requests (${requests.length}):`));
        requests.forEach((r) => {
            const statusColor = r.status === 'ACCEPTED' ? chalk_1.default.green :
                r.status === 'PENDING' ? chalk_1.default.yellow : chalk_1.default.red;
            console.log(`  ${r.id} - ${statusColor(r.status)} - ${r.amount_inquired.value} ${r.amount_inquired.currency}`);
        });
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
//# sourceMappingURL=bunq.js.map