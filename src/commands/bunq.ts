/**
 * Payment Skill - Bunq Commands
 * 
 * Bunq API CLI commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { BunqClient } from '../api/bunq';
import { configManager } from '../core/config';
import { transactionManager } from '../core/transaction';

export const bunqCommands = new Command('bunq')
  .description('Bunq API operations');

// List accounts
bunqCommands
  .command('accounts')
  .description('List monetary accounts')
  .requiredOption('-u, --user <id>', 'User ID')
  .action(async (options) => {
    const spinner = ora('Fetching accounts...').start();
    try {
      const config = configManager.getProvider('bunq');
      if (!config) {
        throw new Error('Bunq not configured. Run: payment-skill provider add bunq');
      }
      
      const client = new BunqClient(config as any);
      const accounts = await client.getMonetaryAccounts(options.user);
      
      spinner.stop();
      console.log(chalk.blue('Monetary Accounts:'));
      accounts.forEach((acc: any) => {
        console.log(`  ${acc.id} - ${acc.description} - ${acc.balance.value} ${acc.balance.currency}`);
      });
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Get balance
bunqCommands
  .command('balance')
  .description('Get account balance')
  .requiredOption('-u, --user <id>', 'User ID')
  .requiredOption('-a, --account <id>', 'Account ID')
  .action(async (options) => {
    const spinner = ora('Fetching balance...').start();
    try {
      const config = configManager.getProvider('bunq');
      if (!config) {
        throw new Error('Bunq not configured');
      }
      
      const client = new BunqClient(config as any);
      const account = await client.getMonetaryAccount(options.user, options.account);
      
      spinner.stop();
      console.log(chalk.blue('Account Balance:'));
      console.log(`  ${account.balance.value} ${account.balance.currency}`);
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Create payment
bunqCommands
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
    const spinner = ora('Creating payment...').start();
    try {
      const config = configManager.getProvider('bunq');
      if (!config) {
        throw new Error('Bunq not configured');
      }
      
      // Create transaction record
      const tx = transactionManager.createTransaction(
        'bunq',
        'bunq-payment',
        parseFloat(options.amount),
        options.currency,
        { toIban: options.toIban, description: options.description }
      );
      
      const client = new BunqClient(config as any);
      const payment = await client.createPayment(
        options.user,
        options.account,
        options.amount,
        options.currency,
        options.toIban,
        options.toName,
        options.description
      );
      
      transactionManager.updateTransactionStatus(tx.id, 'completed');
      
      spinner.succeed(chalk.green('Payment created'));
      console.log(`  Transaction ID: ${tx.id}`);
      console.log(`  Payment ID: ${payment.id}`);
      console.log(`  Status: ${payment.status}`);
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// Create payment request
bunqCommands
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
    const spinner = ora('Creating payment request...').start();
    try {
      const config = configManager.getProvider('bunq');
      if (!config) {
        throw new Error('Bunq not configured');
      }
      
      const client = new BunqClient(config as any);
      const request = await client.createRequestInquiry(
        options.user,
        options.account,
        options.amount,
        options.currency,
        {
          type: options.type,
          value: options.to,
          name: options.to
        },
        options.description
      );
      
      spinner.succeed(chalk.green('Payment request created'));
      console.log(`  Request ID: ${request.id}`);
      console.log(`  Status: ${request.status}`);
      console.log(chalk.yellow('  Waiting for recipient to accept...'));
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// List payments
bunqCommands
  .command('payments')
  .description('List payments')
  .requiredOption('-u, --user <id>', 'User ID')
  .requiredOption('-a, --account <id>', 'Account ID')
  .option('-l, --limit <number>', 'Limit results', '10')
  .action(async (options) => {
    const spinner = ora('Fetching payments...').start();
    try {
      const config = configManager.getProvider('bunq');
      if (!config) {
        throw new Error('Bunq not configured');
      }
      
      const client = new BunqClient(config as any);
      const payments = await client.getPayments(options.user, options.account, parseInt(options.limit));
      
      spinner.stop();
      console.log(chalk.blue(`Payments (${payments.length}):`));
      payments.forEach((p: any) => {
        const direction = p.amount.value.startsWith('-') ? 'OUT' : 'IN';
        const color = direction === 'OUT' ? chalk.red : chalk.green;
        console.log(`  ${p.id} - ${color(direction)} - ${p.amount.value} ${p.amount.currency} - ${p.description}`);
      });
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });

// List requests
bunqCommands
  .command('requests')
  .description('List payment requests')
  .requiredOption('-u, --user <id>', 'User ID')
  .requiredOption('-a, --account <id>', 'Account ID')
  .action(async (options) => {
    const spinner = ora('Fetching requests...').start();
    try {
      const config = configManager.getProvider('bunq');
      if (!config) {
        throw new Error('Bunq not configured');
      }
      
      const client = new BunqClient(config as any);
      const requests = await client.getRequestInquiries(options.user, options.account);
      
      spinner.stop();
      console.log(chalk.blue(`Payment Requests (${requests.length}):`));
      requests.forEach((r: any) => {
        const statusColor = r.status === 'ACCEPTED' ? chalk.green : 
                           r.status === 'PENDING' ? chalk.yellow : chalk.red;
        console.log(`  ${r.id} - ${statusColor(r.status)} - ${r.amount_inquired.value} ${r.amount_inquired.currency}`);
      });
    } catch (error: any) {
      spinner.fail(error.message);
      process.exit(1);
    }
  });