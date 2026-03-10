/**
 * Payment Skill - Wise Commands
 * 
 * Wise API CLI commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { WiseClient } from '../api/wise';
import { configManager } from '../core/config';
import { transactionManager } from '../core/transaction';

export const wiseCommands = new Command('wise')
  .description('Wise API operations');

// Balance commands
wiseCommands
  .command('balance')
  .description('Get Wise account balances')
  .option('-p, --profile <id>', 'Profile ID')
  .action(async (options) => {
    const spinner = ora('Fetching balances...').start();
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured. Run: payment-skill provider add wise');
      }
      
      const client = new WiseClient(config as any);
      const profileId = options.profile || config.profileId;
      
      if (!profileId) {
        throw new Error('Profile ID required. Use --profile or set default');
      }
      
      const balances = await client.getBalances(profileId);
      spinner.stop();
      
      console.log(chalk.blue('Wise Balances:'));
      balances.forEach((balance: any) => {
        console.log(`  ${balance.currency}: ${balance.amount.value}`);
      });
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Quote commands
wiseCommands
  .command('quote')
  .description('Create a quote (lock exchange rate)')
  .requiredOption('-s, --source <currency>', 'Source currency')
  .requiredOption('-t, --target <currency>', 'Target currency')
  .option('-a, --amount <amount>', 'Source amount')
  .option('-p, --profile <id>', 'Profile ID')
  .action(async (options) => {
    const spinner = ora('Creating quote...').start();
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured');
      }
      
      const client = new WiseClient(config as any);
      const profileId = options.profile || config.profileId;
      
      const quote = await client.createQuote(
        profileId,
        options.source,
        options.target,
        parseFloat(options.amount)
      );
      
      spinner.stop();
      console.log(chalk.green('✓ Quote created'));
      console.log(`  ID: ${quote.id}`);
      console.log(`  Rate: ${quote.rate}`);
      console.log(`  Fee: ${quote.fee}`);
      console.log(`  Total: ${quote.sourceAmount}`);
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Transfer commands
wiseCommands
  .command('transfer')
  .description('Create a transfer')
  .requiredOption('-q, --quote <id>', 'Quote ID')
  .requiredOption('-r, --recipient <id>', 'Recipient account ID')
  .option('-m, --reference <text>', 'Payment reference')
  .option('-p, --profile <id>', 'Profile ID')
  .action(async (options) => {
    const spinner = ora('Creating transfer...').start();
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured');
      }
      
      // Create transaction record
      const tx = transactionManager.createTransaction(
        'wise',
        'wise-transfer',
        0, // Will update with actual amount
        'EUR',
        { quoteId: options.quote, recipientId: options.recipient }
      );
      
      const client = new WiseClient(config as any);
      const profileId = options.profile || config.profileId;
      
      const transfer = await client.createTransfer(
        profileId,
        options.quote,
        options.recipient,
        options.reference
      );
      
      transactionManager.updateTransactionStatus(tx.id, 'initiated');
      
      spinner.stop();
      console.log(chalk.green('✓ Transfer created'));
      console.log(`  Transaction ID: ${tx.id}`);
      console.log(`  Transfer ID: ${transfer.id}`);
      console.log(`  Status: ${transfer.status}`);
      
      if (transfer.status === 'pending') {
        console.log(chalk.yellow('\n⚠️  Transfer requires funding'));
        console.log(`Run: payment-skill wise fund ${transfer.id}`);
      }
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Fund transfer
wiseCommands
  .command('fund')
  .description('Fund a transfer from balance')
  .argument('<transferId>', 'Transfer ID to fund')
  .option('-p, --profile <id>', 'Profile ID')
  .action(async (transferId, options) => {
    const spinner = ora('Funding transfer...').start();
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured');
      }
      
      const client = new WiseClient(config as any);
      const profileId = options.profile || config.profileId;
      
      const payment = await client.fundTransfer(profileId, transferId);
      
      spinner.stop();
      console.log(chalk.green('✓ Transfer funded'));
      console.log(`  Status: ${payment.status}`);
      
      if (payment.status === 'pending') {
        console.log(chalk.yellow('\n⚠️  PSD2: Open Wise app to confirm'));
      }
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// List transfers
wiseCommands
  .command('list')
  .description('List transfers')
  .option('-p, --profile <id>', 'Profile ID')
  .option('-s, --status <status>', 'Filter by status')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(async (options) => {
    const spinner = ora('Fetching transfers...').start();
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured');
      }
      
      const client = new WiseClient(config as any);
      const profileId = options.profile || config.profileId;
      
      const transfers = await client.getTransfers(
        profileId,
        options.status,
        parseInt(options.limit)
      );
      
      spinner.stop();
      console.log(chalk.blue(`Transfers (${transfers.length}):`));
      transfers.forEach((t: any) => {
        const statusColor = t.status === 'completed' ? chalk.green : 
                           t.status === 'pending' ? chalk.yellow : chalk.red;
        console.log(`  ${t.id} - ${statusColor(t.status)} - ${t.sourceValue} ${t.sourceCurrency}`);
      });
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Get transfer status
wiseCommands
  .command('status')
  .description('Get transfer status')
  .argument('<transferId>', 'Transfer ID')
  .option('--poll', 'Poll until completion')
  .option('-i, --interval <seconds>', 'Poll interval', '5')
  .action(async (transferId, options) => {
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured');
      }
      
      const client = new WiseClient(config as any);
      
      if (options.poll) {
        console.log(chalk.blue(`Polling transfer ${transferId}...`));
        const spinner = ora('Waiting...').start();
        
        while (true) {
          const transfer = await client.getTransfer(transferId);
          spinner.text = `Status: ${transfer.status}`;
          
          if (transfer.status === 'completed') {
            spinner.succeed(chalk.green(`Transfer completed!`));
            break;
          } else if (transfer.status === 'cancelled' || transfer.status === 'failed') {
            spinner.fail(`Transfer ${transfer.status}`);
            break;
          }
          
          await new Promise(r => setTimeout(r, parseInt(options.interval) * 1000));
        }
      } else {
        const transfer = await client.getTransfer(transferId);
        console.log(chalk.blue('Transfer Status:'));
        console.log(`  ID: ${transfer.id}`);
        console.log(`  Status: ${transfer.status}`);
        console.log(`  Amount: ${transfer.sourceValue} ${transfer.sourceCurrency}`);
        console.log(`  Created: ${transfer.created}`);
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

// Cancel transfer
wiseCommands
  .command('cancel')
  .description('Cancel a pending transfer')
  .argument('<transferId>', 'Transfer ID to cancel')
  .action(async (transferId) => {
    const spinner = ora('Cancelling transfer...').start();
    try {
      const config = configManager.getProvider('wise');
      if (!config) {
        throw new Error('Wise not configured');
      }
      
      const client = new WiseClient(config as any);
      await client.cancelTransfer(transferId);
      
      spinner.succeed(chalk.green('Transfer cancelled'));
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });