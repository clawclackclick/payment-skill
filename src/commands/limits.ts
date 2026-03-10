/**
 * Payment Skill - Limit Commands
 * 
 * Manage payment limits and controls including:
 * - Account Limits (per transaction, daily, weekly, monthly)
 * - Cumulative Budgets (rolling budgets with auto-reset)
 * - Domain Controls (whitelist/blacklist merchant domains)
 * - Time Window Controls
 * - Geography Controls (allow/block by country)
 * - Category Controls (block/allow spending categories)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config';

export const limitCommands = new Command('limits')
  .description('Manage payment limits and controls');

// Account Limits
limitCommands
  .command('get')
  .description('Get all limits and controls')
  .action(() => {
    console.log(chalk.blue('=== ACCOUNT LIMITS ==='));
    const limits = configManager.getLimits();
    console.log(`  Per Transaction: ${limits.perTransaction}`);
    console.log(`  Daily: ${limits.daily}`);
    console.log(`  Weekly: ${limits.weekly}`);
    console.log(`  Monthly: ${limits.monthly}`);
    console.log(`  Max per Hour: ${limits.maxTransactionsPerHour}`);

    console.log(chalk.blue('\n=== CUMULATIVE BUDGETS ==='));
    const budgets = configManager.getCumulativeBudgets();
    if (budgets.length === 0) {
      console.log('  No budgets configured');
    } else {
      budgets.forEach((b, i) => {
        console.log(`  ${i + 1}. ${b.amount} ${b.currency || ''} per ${b.period}`);
      });
    }

    console.log(chalk.blue('\n=== DOMAIN CONTROLS ==='));
    const domainControls = configManager.getDomainControls();
    console.log(`  Mode: ${domainControls.mode}`);
    console.log(`  Domains: ${domainControls.domains.length > 0 ? domainControls.domains.join(', ') : 'None'}`);

    console.log(chalk.blue('\n=== TIME WINDOW ==='));
    const tw = configManager.getTimeWindow();
    console.log(`  Enabled: ${tw.enabled ? 'Yes' : 'No'}`);
    console.log(`  Hours: ${tw.start} - ${tw.end}`);
    console.log(`  Timezone: ${tw.timezone}`);

    console.log(chalk.blue('\n=== GEOGRAPHY CONTROLS ==='));
    const geoControls = configManager.getGeographyControls();
    console.log(`  Enabled: ${geoControls.enabled ? 'Yes' : 'No'}`);
    console.log(`  Mode: ${geoControls.mode}`);
    console.log(`  Countries: ${geoControls.countries.length > 0 ? geoControls.countries.join(', ') : 'None'}`);

    console.log(chalk.blue('\n=== CATEGORY CONTROLS ==='));
    const catControls = configManager.getCategoryControls();
    console.log(`  Blocked: ${catControls.blockedCategories.join(', ') || 'None'}`);
    console.log(`  Allowed (whitelist): ${catControls.allowedCategories?.join(', ') || 'None (all except blocked)'}`);
  });

limitCommands
  .command('set')
  .description('Set basic account limits')
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
    console.log(chalk.green('✓ Account limits updated'));
  });

// Cumulative Budgets
const budgetCommands = new Command('budget')
  .description('Cumulative budget management');

budgetCommands
  .command('add')
  .description('Add a cumulative budget')
  .requiredOption('--amount <amount>', 'Budget amount')
  .option('--currency <currency>', 'Currency', 'EUR')
  .requiredOption('--period <period>', 'Period: daily, weekly, monthly')
  .option('--reset-day <day>', 'For monthly: day of month (1-31)')
  .option('--reset-day-of-week <day>', 'For weekly: day of week (0=Sun, 6=Sat)')
  .action((options) => {
    const budget = {
      enabled: true,
      amount: parseFloat(options.amount),
      currency: options.currency,
      period: options.period,
      resetDay: options.resetDay ? parseInt(options.resetDay) : undefined,
      resetDayOfWeek: options.resetDayOfWeek ? parseInt(options.resetDayOfWeek) : undefined
    };
    configManager.addCumulativeBudget(budget);
    console.log(chalk.green(`✓ Budget added: ${budget.amount} ${budget.currency} per ${budget.period}`));
  });

budgetCommands
  .command('list')
  .description('List all budgets')
  .action(() => {
    const budgets = configManager.getCumulativeBudgets();
    if (budgets.length === 0) {
      console.log(chalk.yellow('No budgets configured'));
    } else {
      console.log(chalk.blue('Cumulative Budgets:'));
      budgets.forEach((b, i) => {
        console.log(`  ${i}. ${b.amount} ${b.currency || ''} per ${b.period} ${b.enabled ? '' : '(disabled)'}`);
      });
    }
  });

budgetCommands
  .command('remove')
  .description('Remove a budget')
  .argument('<index>', 'Budget index')
  .action((index) => {
    configManager.removeCumulativeBudget(parseInt(index));
    console.log(chalk.green('✓ Budget removed'));
  });

limitCommands.addCommand(budgetCommands);

// Domain Controls
const domainCommands = new Command('domain')
  .description('Domain controls (whitelist/blacklist merchant domains)');

domainCommands
  .command('set-mode')
  .description('Set domain control mode')
  .argument('<mode>', 'Mode: whitelist or blacklist')
  .action((mode) => {
    if (mode !== 'whitelist' && mode !== 'blacklist') {
      console.log(chalk.red('Mode must be "whitelist" or "blacklist"'));
      return;
    }
    const controls = configManager.getDomainControls();
    controls.mode = mode;
    configManager.setDomainControls(controls);
    console.log(chalk.green(`✓ Domain control mode set to: ${mode}`));
  });

domainCommands
  .command('add')
  .description('Add a domain to the list')
  .argument('<domain>', 'Domain (e.g., example.com)')
  .action((domain) => {
    configManager.addDomain(domain);
    console.log(chalk.green(`✓ Domain added: ${domain}`));
  });

domainCommands
  .command('remove')
  .description('Remove a domain from the list')
  .argument('<domain>', 'Domain to remove')
  .action((domain) => {
    configManager.removeDomain(domain);
    console.log(chalk.green(`✓ Domain removed: ${domain}`));
  });

domainCommands
  .command('list')
  .description('List all domains')
  .action(() => {
    const controls = configManager.getDomainControls();
    console.log(chalk.blue(`Mode: ${controls.mode}`));
    console.log(chalk.blue('Domains:'));
    if (controls.domains.length === 0) {
      console.log('  None');
    } else {
      controls.domains.forEach((d: string) => console.log(`  - ${d}`));
    }
  });

limitCommands.addCommand(domainCommands);

// Time Window Controls
const timeWindowCommands = new Command('time-window')
  .description('Time window controls');

timeWindowCommands
  .command('get')
  .description('Get time window settings')
  .action(() => {
    const tw = configManager.getTimeWindow();
    console.log(chalk.blue('Time Window:'));
    console.log(`  Enabled: ${tw.enabled ? 'Yes' : 'No'}`);
    console.log(`  Start: ${tw.start}`);
    console.log(`  End: ${tw.end}`);
    console.log(`  Timezone: ${tw.timezone}`);
  });

timeWindowCommands
  .command('set')
  .description('Set time window')
  .option('--start <time>', 'Start time (HH:MM)')
  .option('--end <time>', 'End time (HH:MM)')
  .option('--timezone <tz>', 'Timezone (e.g., Europe/Bucharest)')
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

// Geography Controls
const geoCommands = new Command('geo')
  .description('Geography controls (allow/block by country)');

geoCommands
  .command('enable')
  .description('Enable geography controls')
  .action(() => {
    const controls = configManager.getGeographyControls();
    controls.enabled = true;
    configManager.setGeographyControls(controls);
    console.log(chalk.green('✓ Geography controls enabled'));
  });

geoCommands
  .command('disable')
  .description('Disable geography controls')
  .action(() => {
    const controls = configManager.getGeographyControls();
    controls.enabled = false;
    configManager.setGeographyControls(controls);
    console.log(chalk.green('✓ Geography controls disabled'));
  });

geoCommands
  .command('set-mode')
  .description('Set geography mode')
  .argument('<mode>', 'Mode: allow or block')
  .action((mode) => {
    if (mode !== 'allow' && mode !== 'block') {
      console.log(chalk.red('Mode must be "allow" or "block"'));
      return;
    }
    const controls = configManager.getGeographyControls();
    controls.mode = mode;
    configManager.setGeographyControls(controls);
    console.log(chalk.green(`✓ Geography mode set to: ${mode}`));
  });

geoCommands
  .command('add')
  .description('Add a country (ISO code)')
  .argument('<country>', 'Country code (e.g., US, DE, RO)')
  .action((country) => {
    const controls = configManager.getGeographyControls();
    if (!controls.countries.includes(country.toUpperCase())) {
      controls.countries.push(country.toUpperCase());
      configManager.setGeographyControls(controls);
      console.log(chalk.green(`✓ Country added: ${country.toUpperCase()}`));
    } else {
      console.log(chalk.yellow('Country already in list'));
    }
  });

geoCommands
  .command('remove')
  .description('Remove a country')
  .argument('<country>', 'Country code to remove')
  .action((country) => {
    const controls = configManager.getGeographyControls();
    controls.countries = controls.countries.filter((c: string) => c !== country.toUpperCase());
    configManager.setGeographyControls(controls);
    console.log(chalk.green(`✓ Country removed: ${country.toUpperCase()}`));
  });

geoCommands
  .command('list')
  .description('List all countries')
  .action(() => {
    const controls = configManager.getGeographyControls();
    console.log(chalk.blue(`Enabled: ${controls.enabled ? 'Yes' : 'No'}`));
    console.log(chalk.blue(`Mode: ${controls.mode}`));
    console.log(chalk.blue('Countries:'));
    if (controls.countries.length === 0) {
      console.log('  None');
    } else {
      controls.countries.forEach((c: string) => console.log(`  - ${c}`));
    }
  });

limitCommands.addCommand(geoCommands);

// Category Controls
const categoryCommands = new Command('category')
  .description('Category controls (block/allow spending categories)');

categoryCommands
  .command('block')
  .description('Block a category')
  .argument('<category>', 'Category name')
  .action((category) => {
    configManager.addBlockedCategory(category);
    console.log(chalk.green(`✓ Category blocked: ${category}`));
  });

categoryCommands
  .command('unblock')
  .description('Unblock a category')
  .argument('<category>', 'Category name')
  .action((category) => {
    configManager.removeBlockedCategory(category);
    console.log(chalk.green(`✓ Category unblocked: ${category}`));
  });

categoryCommands
  .command('allow')
  .description('Add to allowed categories (whitelist mode)')
  .argument('<category>', 'Category name')
  .action((category) => {
    configManager.addAllowedCategory(category);
    console.log(chalk.green(`✓ Category added to allowed list: ${category}`));
  });

categoryCommands
  .command('disallow')
  .description('Remove from allowed categories')
  .argument('<category>', 'Category name')
  .action((category) => {
    configManager.removeAllowedCategory(category);
    console.log(chalk.green(`✓ Category removed from allowed list: ${category}`));
  });

categoryCommands
  .command('list')
  .description('List category controls')
  .action(() => {
    const controls = configManager.getCategoryControls();
    console.log(chalk.blue('Blocked Categories:'));
    if (controls.blockedCategories.length === 0) {
      console.log('  None');
    } else {
      controls.blockedCategories.forEach((c: string) => console.log(`  - ${c}`));
    }
    console.log(chalk.blue('\nAllowed Categories (whitelist):'));
    if (!controls.allowedCategories || controls.allowedCategories.length === 0) {
      console.log('  None (all categories allowed except blocked)');
    } else {
      controls.allowedCategories.forEach((c: string) => console.log(`  - ${c}`));
    }
  });

limitCommands.addCommand(categoryCommands);