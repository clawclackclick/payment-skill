"use strict";
/**
 * Payment Skill - Emergency Commands
 *
 * Emergency stop and safety CLI commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emergencyCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../core/config");
const transaction_1 = require("../core/transaction");
exports.emergencyCommands = new commander_1.Command('emergency')
    .description('Emergency stop and safety controls');
exports.emergencyCommands
    .command('stop')
    .description('Activate emergency stop - halt all transactions')
    .option('-r, --reason <reason>', 'Reason for emergency stop')
    .action((options) => {
    const reason = options.reason || 'Manual activation';
    console.log(chalk_1.default.red.bold('🚨 ACTIVATING EMERGENCY STOP'));
    console.log(chalk_1.default.red(`Reason: ${reason}`));
    // Get pending transactions
    const pending = transaction_1.transactionManager.getPendingTransactions();
    console.log(chalk_1.default.yellow(`Found ${pending.length} pending transactions`));
    // Activate emergency stop
    config_1.configManager.activateEmergencyStop(reason);
    // Cancel all pending
    const cancelled = transaction_1.transactionManager.cancelAllPending();
    console.log(chalk_1.default.green(`✓ Emergency stop activated`));
    console.log(chalk_1.default.green(`✓ Cancelled ${cancelled} pending transactions`));
    console.log(chalk_1.default.red.bold('\n⚠️  All API operations are now BLOCKED'));
    console.log(chalk_1.default.gray('Use "payment-skill emergency resume" to re-enable'));
});
exports.emergencyCommands
    .command('resume')
    .description('Deactivate emergency stop - resume operations')
    .action(() => {
    if (!config_1.configManager.isEmergencyStopActive()) {
        console.log(chalk_1.default.yellow('Emergency stop is not active'));
        return;
    }
    console.log(chalk_1.default.blue('Deactivating emergency stop...'));
    config_1.configManager.deactivateEmergencyStop();
    console.log(chalk_1.default.green('✓ Emergency stop deactivated'));
    console.log(chalk_1.default.green('✓ API operations resumed'));
});
exports.emergencyCommands
    .command('status')
    .description('Check emergency stop status')
    .action(() => {
    const state = config_1.configManager.getEmergencyStopState();
    if (state.active) {
        console.log(chalk_1.default.red.bold('🚨 EMERGENCY STOP IS ACTIVE'));
        console.log(chalk_1.default.red(`Activated: ${state.activatedAt}`));
        console.log(chalk_1.default.red(`Reason: ${state.reason}`));
        console.log(chalk_1.default.yellow(`Pending transactions on hold: ${state.pendingTransactions.length}`));
    }
    else {
        console.log(chalk_1.default.green('✓ Emergency stop is inactive'));
        console.log(chalk_1.default.gray('All operations normal'));
    }
});
exports.emergencyCommands
    .command('kill-all')
    .description('Kill all pending transactions (use with caution)')
    .option('-f, --force', 'Force without confirmation')
    .action((options) => {
    const pending = transaction_1.transactionManager.getPendingTransactions();
    if (pending.length === 0) {
        console.log(chalk_1.default.yellow('No pending transactions to kill'));
        return;
    }
    console.log(chalk_1.default.red.bold(`⚠️  About to kill ${pending.length} pending transactions`));
    if (!options.force) {
        console.log(chalk_1.default.yellow('Use --force to confirm'));
        return;
    }
    const cancelled = transaction_1.transactionManager.cancelAllPending();
    console.log(chalk_1.default.green(`✓ Killed ${cancelled} transactions`));
});
//# sourceMappingURL=emergency.js.map