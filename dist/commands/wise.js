"use strict";
/**
 * Payment Skill - Wise Commands
 *
 * Wise API CLI commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wiseCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const wise_1 = require("../api/wise");
const config_1 = require("../core/config");
const transaction_1 = require("../core/transaction");
exports.wiseCommands = new commander_1.Command('wise')
    .description('Wise API operations');
// Balance commands
exports.wiseCommands
    .command('balance')
    .description('Get Wise account balances')
    .option('-p, --profile <id>', 'Profile ID')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Fetching balances...').start();
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured. Run: payment-skill provider add wise');
        }
        const client = new wise_1.WiseClient(config);
        const profileId = options.profile || config.profileId;
        if (!profileId) {
            throw new Error('Profile ID required. Use --profile or set default');
        }
        const balances = await client.getBalances(profileId);
        spinner.stop();
        console.log(chalk_1.default.blue('Wise Balances:'));
        balances.forEach((balance) => {
            console.log(`  ${balance.currency}: ${balance.amount.value}`);
        });
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Quote commands
exports.wiseCommands
    .command('quote')
    .description('Create a quote (lock exchange rate)')
    .requiredOption('-s, --source <currency>', 'Source currency')
    .requiredOption('-t, --target <currency>', 'Target currency')
    .option('-a, --amount <amount>', 'Source amount')
    .option('-p, --profile <id>', 'Profile ID')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Creating quote...').start();
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        const client = new wise_1.WiseClient(config);
        const profileId = options.profile || config.profileId;
        const quote = await client.createQuote(profileId, options.source, options.target, parseFloat(options.amount));
        spinner.stop();
        console.log(chalk_1.default.green('✓ Quote created'));
        console.log(`  ID: ${quote.id}`);
        console.log(`  Rate: ${quote.rate}`);
        console.log(`  Fee: ${quote.fee}`);
        console.log(`  Total: ${quote.sourceAmount}`);
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Transfer commands
exports.wiseCommands
    .command('transfer')
    .description('Create a transfer')
    .requiredOption('-q, --quote <id>', 'Quote ID')
    .requiredOption('-r, --recipient <id>', 'Recipient account ID')
    .option('-m, --reference <text>', 'Payment reference')
    .option('-p, --profile <id>', 'Profile ID')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Creating transfer...').start();
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        // Create transaction record
        const tx = transaction_1.transactionManager.createTransaction('wise', 'wise-transfer', 0, // Will update with actual amount
        'EUR', { quoteId: options.quote, recipientId: options.recipient });
        const client = new wise_1.WiseClient(config);
        const profileId = options.profile || config.profileId;
        const transfer = await client.createTransfer(profileId, options.quote, options.recipient, options.reference);
        transaction_1.transactionManager.updateTransactionStatus(tx.id, 'initiated');
        spinner.stop();
        console.log(chalk_1.default.green('✓ Transfer created'));
        console.log(`  Transaction ID: ${tx.id}`);
        console.log(`  Transfer ID: ${transfer.id}`);
        console.log(`  Status: ${transfer.status}`);
        if (transfer.status === 'pending') {
            console.log(chalk_1.default.yellow('\n⚠️  Transfer requires funding'));
            console.log(`Run: payment-skill wise fund ${transfer.id}`);
        }
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Fund transfer
exports.wiseCommands
    .command('fund')
    .description('Fund a transfer from balance')
    .argument('<transferId>', 'Transfer ID to fund')
    .option('-p, --profile <id>', 'Profile ID')
    .action(async (transferId, options) => {
    const spinner = (0, ora_1.default)('Funding transfer...').start();
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        const client = new wise_1.WiseClient(config);
        const profileId = options.profile || config.profileId;
        const payment = await client.fundTransfer(profileId, transferId);
        spinner.stop();
        console.log(chalk_1.default.green('✓ Transfer funded'));
        console.log(`  Status: ${payment.status}`);
        if (payment.status === 'pending') {
            console.log(chalk_1.default.yellow('\n⚠️  PSD2: Open Wise app to confirm'));
        }
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// List transfers
exports.wiseCommands
    .command('list')
    .description('List transfers')
    .option('-p, --profile <id>', 'Profile ID')
    .option('-s, --status <status>', 'Filter by status')
    .option('-l, --limit <number>', 'Limit results', '10')
    .action(async (options) => {
    const spinner = (0, ora_1.default)('Fetching transfers...').start();
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        const client = new wise_1.WiseClient(config);
        const profileId = options.profile || config.profileId;
        const transfers = await client.getTransfers(profileId, options.status, parseInt(options.limit));
        spinner.stop();
        console.log(chalk_1.default.blue(`Transfers (${transfers.length}):`));
        transfers.forEach((t) => {
            const statusColor = t.status === 'completed' ? chalk_1.default.green :
                t.status === 'pending' ? chalk_1.default.yellow : chalk_1.default.red;
            console.log(`  ${t.id} - ${statusColor(t.status)} - ${t.sourceValue} ${t.sourceCurrency}`);
        });
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
// Get transfer status
exports.wiseCommands
    .command('status')
    .description('Get transfer status')
    .argument('<transferId>', 'Transfer ID')
    .option('--poll', 'Poll until completion')
    .option('-i, --interval <seconds>', 'Poll interval', '5')
    .action(async (transferId, options) => {
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        const client = new wise_1.WiseClient(config);
        if (options.poll) {
            console.log(chalk_1.default.blue(`Polling transfer ${transferId}...`));
            const spinner = (0, ora_1.default)('Waiting...').start();
            while (true) {
                const transfer = await client.getTransfer(transferId);
                spinner.text = `Status: ${transfer.status}`;
                if (transfer.status === 'completed') {
                    spinner.succeed(chalk_1.default.green(`Transfer completed!`));
                    break;
                }
                else if (transfer.status === 'cancelled' || transfer.status === 'failed') {
                    spinner.fail(`Transfer ${transfer.status}`);
                    break;
                }
                await new Promise(r => setTimeout(r, parseInt(options.interval) * 1000));
            }
        }
        else {
            const transfer = await client.getTransfer(transferId);
            console.log(chalk_1.default.blue('Transfer Status:'));
            console.log(`  ID: ${transfer.id}`);
            console.log(`  Status: ${transfer.status}`);
            console.log(`  Amount: ${transfer.sourceValue} ${transfer.sourceCurrency}`);
            console.log(`  Created: ${transfer.created}`);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
// Cancel transfer
exports.wiseCommands
    .command('cancel')
    .description('Cancel a pending transfer')
    .argument('<transferId>', 'Transfer ID to cancel')
    .action(async (transferId) => {
    const spinner = (0, ora_1.default)('Cancelling transfer...').start();
    try {
        const config = config_1.configManager.getProvider('wise');
        if (!config) {
            throw new Error('Wise not configured');
        }
        const client = new wise_1.WiseClient(config);
        await client.cancelTransfer(transferId);
        spinner.succeed(chalk_1.default.green('Transfer cancelled'));
    }
    catch (error) {
        spinner.fail(error.message);
        process.exit(1);
    }
});
//# sourceMappingURL=wise.js.map