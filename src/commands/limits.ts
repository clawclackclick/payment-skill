/**
 * Payment Skill - Limit Commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config';

export const limitCommands = new Command('limits')
  .description('Manage payment limits and controls');

limitCommands
  .command('get')
  .description('Get current limits')
  .action(() => {
    const limits = configManager.getLimits();
    console.log(chalk.blue('Current Limits:'));
    console.log(`  Per Transaction: ${limits.perTransaction}`);
    console.log(`  Daily: ${limits.daily}`);
    console.log(`  Weekly: ${limits.weekly}`);
    console.log(`  Monthly: ${limits.monthly}`);
    console.log(`  Max per Hour: ${limits.maxTransactionsPerHour}`);
  });

limitCommands
  .command('set')
  .description('Set limits')
  .option('--per-transaction <amount>', 'Per transaction limit')
  .option('--daily <amount>', 'Daily limit')
  .option('--weekly <amount>', 'Weekly limit')
  .option('--monthly <amount>', 'Monthly limit')
  .option('--max-per-hour <count>', 'Max transactions per hour')
  .action((options) => {
    const limits: any = {};
    if (options.perTransaction) limits.perTransaction = parseInt(options.perTransaction);
    if (options.daily) limits.daily = parseInt(options.daily);
    if (options.weekly) limits.weekly = parseInt(options.weekly);
    if (options.monthly) limits.monthly = parseInt(options.monthly);
    if (options.maxPerHour) limits.maxTransactionsPerHour = parseInt(options.maxPerHour);
    
    configManager.setLimits(limits);
    console.log(chalk.green('✓ Limits updated'));
  });

const timeWindowCommands = new Command('time-window')
  .description('Time window controls');

timeWindowCommands
  .command('get')
  .description('Get time window settings')
  .action(() => {
    const tw = configManager.getTimeWindow();
    console.log(chalk.blue('Time Window:'));
    console.log(`  Enabled: ${tw.enabled}`);
    console.log(`  Start: ${tw.start}`);
    console.log(`  End: ${tw.end}`);
    console.log(`  Timezone: ${tw.timezone}`);
  });

timeWindowCommands
  .command('set')
  .description('Set time window')
  .option('--start <time>', 'Start time (HH:MM)')
  .option('--end <time>', 'End time (HH:MM)')
  .option('--timezone <tz>', 'Timezone')
  .action((options) => {
    const tw: any = {};
    if (options.start) tw.start = options.start;
    if (options.end) tw.end = options.end;
    if (options.timezone) tw.timezone = options.timezone;
    
    configManager.setTimeWindow(tw);
    console.log(chalk.green('✓ Time window updated'));
  });

timeWindowCommands
  .command('enable')
  .description('Enable time window')
  .action(() => {
    configManager.setTimeWindow({ enabled: true });
    console.log(chalk.green('✓ Time window enabled'));
  });

timeWindowCommands
  .command('disable')
  .description('Disable time window')
  .action(() => {
    configManager.setTimeWindow({ enabled: false });
    console.log(chalk.green('✓ Time window disabled'));
  });

limitCommands.addCommand(timeWindowCommands);

limitCommands
  .command('block')
  .description('Block a merchant')
  .argument('<merchant-id>', 'Merchant ID')
  .action((merchantId) => {
    console.log(chalk.yellow(`Merchant blocking not yet implemented for ${merchantId}`));
  });

limitCommands
  .command('unblock')
  .description('Unblock a merchant')
  .argument('<merchant-id>', 'Merchant ID')
  .action((merchantId) => {
    console.log(chalk.yellow(`Merchant unblocking not yet implemented for ${merchantId}`));
  });

limitCommands
  .command('block-category')
  .description('Block a category')
  .argument('<category>', 'Category name')
  .action((category) => {
    configManager.addBlockedCategory(category);
    console.log(chalk.green(`✓ Category '${category}' blocked`));
  });

limitCommands
  .command('unblock-category')
  .description('Unblock a category')
  .argument('<category>', 'Category name')
  .action((category) => {
    configManager.removeBlockedCategory(category);
    console.log(chalk.green(`✓ Category '${category}' unblocked`));
  });