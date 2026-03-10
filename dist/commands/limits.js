"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limitCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../core/config");
exports.limitCommands = new commander_1.Command('limits')
    .description('Manage payment limits and controls');
// Account Limits
exports.limitCommands
    .command('get')
    .description('Get all limits and controls')
    .action(() => {
    console.log(chalk_1.default.blue('=== ACCOUNT LIMITS ==='));
    const limits = config_1.configManager.getLimits();
    console.log(`  Per Transaction: ${limits.perTransaction}`);
    console.log(`  Daily: ${limits.daily}`);
    console.log(`  Weekly: ${limits.weekly}`);
    console.log(`  Monthly: ${limits.monthly}`);
    console.log(`  Max per Hour: ${limits.maxTransactionsPerHour}`);
    console.log(chalk_1.default.blue('\n=== CUMULATIVE BUDGETS ==='));
    const budgets = config_1.configManager.getCumulativeBudgets();
    if (budgets.length === 0) {
        console.log('  No budgets configured');
    }
    else {
        budgets.forEach((b, i) => {
            console.log(`  ${i + 1}. ${b.amount} ${b.currency || ''} per ${b.period}`);
        });
    }
    console.log(chalk_1.default.blue('\n=== DOMAIN CONTROLS ==='));
    const domainControls = config_1.configManager.getDomainControls();
    console.log(`  Mode: ${domainControls.mode}`);
    console.log(`  Domains: ${domainControls.domains.length > 0 ? domainControls.domains.join(', ') : 'None'}`);
    console.log(chalk_1.default.blue('\n=== TIME WINDOW ==='));
    const tw = config_1.configManager.getTimeWindow();
    console.log(`  Enabled: ${tw.enabled ? 'Yes' : 'No'}`);
    console.log(`  Hours: ${tw.start} - ${tw.end}`);
    console.log(`  Timezone: ${tw.timezone}`);
    console.log(chalk_1.default.blue('\n=== GEOGRAPHY CONTROLS ==='));
    const geoControls = config_1.configManager.getGeographyControls();
    console.log(`  Enabled: ${geoControls.enabled ? 'Yes' : 'No'}`);
    console.log(`  Mode: ${geoControls.mode}`);
    console.log(`  Countries: ${geoControls.countries.length > 0 ? geoControls.countries.join(', ') : 'None'}`);
    console.log(chalk_1.default.blue('\n=== CATEGORY CONTROLS ==='));
    const catControls = config_1.configManager.getCategoryControls();
    console.log(`  Blocked: ${catControls.blockedCategories.join(', ') || 'None'}`);
    console.log(`  Allowed (whitelist): ${catControls.allowedCategories?.join(', ') || 'None (all except blocked)'}`);
});
exports.limitCommands
    .command('set')
    .description('Set basic account limits')
    .option('--per-transaction <amount>', 'Per transaction limit')
    .option('--daily <amount>', 'Daily limit')
    .option('--weekly <amount>', 'Weekly limit')
    .option('--monthly <amount>', 'Monthly limit')
    .option('--max-per-hour <count>', 'Max transactions per hour')
    .action((options) => {
    const limits = {};
    if (options.perTransaction)
        limits.perTransaction = parseInt(options.perTransaction);
    if (options.daily)
        limits.daily = parseInt(options.daily);
    if (options.weekly)
        limits.weekly = parseInt(options.weekly);
    if (options.monthly)
        limits.monthly = parseInt(options.monthly);
    if (options.maxPerHour)
        limits.maxTransactionsPerHour = parseInt(options.maxPerHour);
    config_1.configManager.setLimits(limits);
    console.log(chalk_1.default.green('✓ Account limits updated'));
});
// Cumulative Budgets
const budgetCommands = new commander_1.Command('budget')
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
    config_1.configManager.addCumulativeBudget(budget);
    console.log(chalk_1.default.green(`✓ Budget added: ${budget.amount} ${budget.currency} per ${budget.period}`));
});
budgetCommands
    .command('list')
    .description('List all budgets')
    .action(() => {
    const budgets = config_1.configManager.getCumulativeBudgets();
    if (budgets.length === 0) {
        console.log(chalk_1.default.yellow('No budgets configured'));
    }
    else {
        console.log(chalk_1.default.blue('Cumulative Budgets:'));
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
    config_1.configManager.removeCumulativeBudget(parseInt(index));
    console.log(chalk_1.default.green('✓ Budget removed'));
});
exports.limitCommands.addCommand(budgetCommands);
// Domain Controls
const domainCommands = new commander_1.Command('domain')
    .description('Domain controls (whitelist/blacklist merchant domains)');
domainCommands
    .command('set-mode')
    .description('Set domain control mode')
    .argument('<mode>', 'Mode: whitelist or blacklist')
    .action((mode) => {
    if (mode !== 'whitelist' && mode !== 'blacklist') {
        console.log(chalk_1.default.red('Mode must be "whitelist" or "blacklist"'));
        return;
    }
    const controls = config_1.configManager.getDomainControls();
    controls.mode = mode;
    config_1.configManager.setDomainControls(controls);
    console.log(chalk_1.default.green(`✓ Domain control mode set to: ${mode}`));
});
domainCommands
    .command('add')
    .description('Add a domain to the list')
    .argument('<domain>', 'Domain (e.g., example.com)')
    .action((domain) => {
    config_1.configManager.addDomain(domain);
    console.log(chalk_1.default.green(`✓ Domain added: ${domain}`));
});
domainCommands
    .command('remove')
    .description('Remove a domain from the list')
    .argument('<domain>', 'Domain to remove')
    .action((domain) => {
    config_1.configManager.removeDomain(domain);
    console.log(chalk_1.default.green(`✓ Domain removed: ${domain}`));
});
domainCommands
    .command('list')
    .description('List all domains')
    .action(() => {
    const controls = config_1.configManager.getDomainControls();
    console.log(chalk_1.default.blue(`Mode: ${controls.mode}`));
    console.log(chalk_1.default.blue('Domains:'));
    if (controls.domains.length === 0) {
        console.log('  None');
    }
    else {
        controls.domains.forEach((d) => console.log(`  - ${d}`));
    }
});
exports.limitCommands.addCommand(domainCommands);
// Time Window Controls
const timeWindowCommands = new commander_1.Command('time-window')
    .description('Time window controls');
timeWindowCommands
    .command('get')
    .description('Get time window settings')
    .action(() => {
    const tw = config_1.configManager.getTimeWindow();
    console.log(chalk_1.default.blue('Time Window:'));
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
    const tw = {};
    if (options.start)
        tw.start = options.start;
    if (options.end)
        tw.end = options.end;
    if (options.timezone)
        tw.timezone = options.timezone;
    config_1.configManager.setTimeWindow(tw);
    console.log(chalk_1.default.green('✓ Time window updated'));
});
timeWindowCommands
    .command('enable')
    .description('Enable time window')
    .action(() => {
    config_1.configManager.setTimeWindow({ enabled: true });
    console.log(chalk_1.default.green('✓ Time window enabled'));
});
timeWindowCommands
    .command('disable')
    .description('Disable time window')
    .action(() => {
    config_1.configManager.setTimeWindow({ enabled: false });
    console.log(chalk_1.default.green('✓ Time window disabled'));
});
exports.limitCommands.addCommand(timeWindowCommands);
// Geography Controls
const geoCommands = new commander_1.Command('geo')
    .description('Geography controls (allow/block by country)');
geoCommands
    .command('enable')
    .description('Enable geography controls')
    .action(() => {
    const controls = config_1.configManager.getGeographyControls();
    controls.enabled = true;
    config_1.configManager.setGeographyControls(controls);
    console.log(chalk_1.default.green('✓ Geography controls enabled'));
});
geoCommands
    .command('disable')
    .description('Disable geography controls')
    .action(() => {
    const controls = config_1.configManager.getGeographyControls();
    controls.enabled = false;
    config_1.configManager.setGeographyControls(controls);
    console.log(chalk_1.default.green('✓ Geography controls disabled'));
});
geoCommands
    .command('set-mode')
    .description('Set geography mode')
    .argument('<mode>', 'Mode: allow or block')
    .action((mode) => {
    if (mode !== 'allow' && mode !== 'block') {
        console.log(chalk_1.default.red('Mode must be "allow" or "block"'));
        return;
    }
    const controls = config_1.configManager.getGeographyControls();
    controls.mode = mode;
    config_1.configManager.setGeographyControls(controls);
    console.log(chalk_1.default.green(`✓ Geography mode set to: ${mode}`));
});
geoCommands
    .command('add')
    .description('Add a country (ISO code)')
    .argument('<country>', 'Country code (e.g., US, DE, RO)')
    .action((country) => {
    const controls = config_1.configManager.getGeographyControls();
    if (!controls.countries.includes(country.toUpperCase())) {
        controls.countries.push(country.toUpperCase());
        config_1.configManager.setGeographyControls(controls);
        console.log(chalk_1.default.green(`✓ Country added: ${country.toUpperCase()}`));
    }
    else {
        console.log(chalk_1.default.yellow('Country already in list'));
    }
});
geoCommands
    .command('remove')
    .description('Remove a country')
    .argument('<country>', 'Country code to remove')
    .action((country) => {
    const controls = config_1.configManager.getGeographyControls();
    controls.countries = controls.countries.filter((c) => c !== country.toUpperCase());
    config_1.configManager.setGeographyControls(controls);
    console.log(chalk_1.default.green(`✓ Country removed: ${country.toUpperCase()}`));
});
geoCommands
    .command('list')
    .description('List all countries')
    .action(() => {
    const controls = config_1.configManager.getGeographyControls();
    console.log(chalk_1.default.blue(`Enabled: ${controls.enabled ? 'Yes' : 'No'}`));
    console.log(chalk_1.default.blue(`Mode: ${controls.mode}`));
    console.log(chalk_1.default.blue('Countries:'));
    if (controls.countries.length === 0) {
        console.log('  None');
    }
    else {
        controls.countries.forEach((c) => console.log(`  - ${c}`));
    }
});
exports.limitCommands.addCommand(geoCommands);
// Category Controls
const categoryCommands = new commander_1.Command('category')
    .description('Category controls (block/allow spending categories)');
categoryCommands
    .command('block')
    .description('Block a category')
    .argument('<category>', 'Category name')
    .action((category) => {
    config_1.configManager.addBlockedCategory(category);
    console.log(chalk_1.default.green(`✓ Category blocked: ${category}`));
});
categoryCommands
    .command('unblock')
    .description('Unblock a category')
    .argument('<category>', 'Category name')
    .action((category) => {
    config_1.configManager.removeBlockedCategory(category);
    console.log(chalk_1.default.green(`✓ Category unblocked: ${category}`));
});
categoryCommands
    .command('allow')
    .description('Add to allowed categories (whitelist mode)')
    .argument('<category>', 'Category name')
    .action((category) => {
    config_1.configManager.addAllowedCategory(category);
    console.log(chalk_1.default.green(`✓ Category added to allowed list: ${category}`));
});
categoryCommands
    .command('disallow')
    .description('Remove from allowed categories')
    .argument('<category>', 'Category name')
    .action((category) => {
    config_1.configManager.removeAllowedCategory(category);
    console.log(chalk_1.default.green(`✓ Category removed from allowed list: ${category}`));
});
categoryCommands
    .command('list')
    .description('List category controls')
    .action(() => {
    const controls = config_1.configManager.getCategoryControls();
    console.log(chalk_1.default.blue('Blocked Categories:'));
    if (controls.blockedCategories.length === 0) {
        console.log('  None');
    }
    else {
        controls.blockedCategories.forEach((c) => console.log(`  - ${c}`));
    }
    console.log(chalk_1.default.blue('\nAllowed Categories (whitelist):'));
    if (!controls.allowedCategories || controls.allowedCategories.length === 0) {
        console.log('  None (all categories allowed except blocked)');
    }
    else {
        controls.allowedCategories.forEach((c) => console.log(`  - ${c}`));
    }
});
exports.limitCommands.addCommand(categoryCommands);
//# sourceMappingURL=limits.js.map