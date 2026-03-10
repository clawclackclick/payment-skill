/**
 * Payment Skill - Transaction Commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { transactionManager } from '../core/transaction';

export const transactionCommands = new Command('transaction')
  .description('Manage transactions');

transactionCommands
  .command('list')
  .description('List transactions')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --provider <provider>', 'Filter by provider')
  .option('-m, --merchant <merchant>', 'Filter by merchant')
  .option('--from <date>', 'From date (YYYY-MM-DD)')
  .option('--to <date>', 'To date (YYYY-MM-DD)')
  .action((options) => {
    const filters: any = {};
    if (options.status) filters.status = options.status;
    if (options.provider) filters.provider = options.provider;
    if (options.merchant) filters.merchant = options.merchant;
    if (options.from) filters.from = new Date(options.from);
    if (options.to) filters.to = new Date(options.to);
    
    const txs = transactionManager.getTransactions(filters);
    console.log(chalk.blue(`Transactions (${txs.length}):`));
    txs.forEach(tx => {
      const statusColor = tx.status === 'completed' ? chalk.green : 
                         tx.status === 'pending' ? chalk.yellow : chalk.red;
      console.log(`  ${tx.id} - ${statusColor(tx.status)} - ${tx.amount} ${tx.currency} - ${tx.merchant}`);
    });
  });

transactionCommands
  .command('get')
  .description('Get transaction details')
  .argument('<id>', 'Transaction ID')
  .action((id) => {
    const tx = transactionManager.getTransaction(id);
    if (tx) {
      console.log(JSON.stringify(tx, null, 2));
    } else {
      console.log(chalk.yellow(`Transaction '${id}' not found`));
    }
  });

transactionCommands
  .command('cancel')
  .description('Cancel a transaction')
  .argument('<id>', 'Transaction ID')
  .action((id) => {
    transactionManager.updateTransactionStatus(id, 'cancelled');
    console.log(chalk.green(`✓ Transaction ${id} cancelled`));
  });

transactionCommands
  .command('delete')
  .description('Delete a transaction')
  .argument('<id>', 'Transaction ID')
  .action((id) => {
    transactionManager.deleteTransaction(id);
    console.log(chalk.green(`✓ Transaction ${id} deleted`));
  });