"use strict";
/**
 * Payment Skill - Limit Commands
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
exports.limitCommands
    .command('get')
    .description('Get current limits')
    .action(() => {
    const limits = config_1.configManager.getLimits();
    console.log(chalk_1.default.blue('Current Limits:'));
    console.log(`  Per Transaction: ${limits.perTransaction}`);
    console.log(`  Daily: ${limits.daily}`);
    console.log(`  Weekly: ${limits.weekly}`);
    console.log(`  Monthly: ${limits.monthly}`);
    console.log(`  Max per Hour: ${limits.maxTransactionsPerHour}`);
});
exports.limitCommands
    .command('set')
    .description('Set limits')
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
    console.log(chalk_1.default.green('✓ Limits updated'));
});
const timeWindowCommands = new commander_1.Command('time-window')
    .description('Time window controls');
timeWindowCommands
    .command('get')
    .description('Get time window settings')
    .action(() => {
    const tw = config_1.configManager.getTimeWindow();
    console.log(chalk_1.default.blue('Time Window:'));
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
exports.limitCommands
    .command('block')
    .description('Block a merchant')
    .argument('<merchant-id>', 'Merchant ID')
    .action((merchantId) => {
    console.log(chalk_1.default.yellow(`Merchant blocking not yet implemented for ${merchantId}`));
});
exports.limitCommands
    .command('unblock')
    .description('Unblock a merchant')
    .argument('<merchant-id>', 'Merchant ID')
    .action((merchantId) => {
    console.log(chalk_1.default.yellow(`Merchant unblocking not yet implemented for ${merchantId}`));
});
exports.limitCommands
    .command('block-category')
    .description('Block a category')
    .argument('<category>', 'Category name')
    .action((category) => {
    config_1.configManager.addBlockedCategory(category);
    console.log(chalk_1.default.green(`✓ Category '${category}' blocked`));
});
exports.limitCommands
    .command('unblock-category')
    .description('Unblock a category')
    .argument('<category>', 'Category name')
    .action((category) => {
    config_1.configManager.removeBlockedCategory(category);
    console.log(chalk_1.default.green(`✓ Category '${category}' unblocked`));
});
//# sourceMappingURL=limits.js.map