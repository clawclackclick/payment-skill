/**
 * Payment Skill - Emergency Commands
 * 
 * Emergency stop and safety CLI commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config';
import { transactionManager } from '../core/transaction';

export const emergencyCommands = new Command('emergency')
  .description('Emergency stop and safety controls');

emergencyCommands
  .command('stop')
  .description('Activate emergency stop - halt all transactions')
  .option('-r, --reason <reason>', 'Reason for emergency stop')
  .action((options) => {
    const reason = options.reason || 'Manual activation';
    
    console.log(chalk.red.bold('🚨 ACTIVATING EMERGENCY STOP'));
    console.log(chalk.red(`Reason: ${reason}`));
    
    // Get pending transactions
    const pending = transactionManager.getPendingTransactions();
    console.log(chalk.yellow(`Found ${pending.length} pending transactions`));
    
    // Activate emergency stop
    configManager.activateEmergencyStop(reason);
    
    // Cancel all pending
    const cancelled = transactionManager.cancelAllPending();
    
    console.log(chalk.green(`✓ Emergency stop activated`));
    console.log(chalk.green(`✓ Cancelled ${cancelled} pending transactions`));
    console.log(chalk.red.bold('\n⚠️  All API operations are now BLOCKED'));
    console.log(chalk.gray('Use "payment-skill emergency resume" to re-enable'));
  });

emergencyCommands
  .command('resume')
  .description('Deactivate emergency stop - resume operations')
  .action(() => {
    if (!configManager.isEmergencyStopActive()) {
      console.log(chalk.yellow('Emergency stop is not active'));
      return;
    }
    
    console.log(chalk.blue('Deactivating emergency stop...'));
    configManager.deactivateEmergencyStop();
    console.log(chalk.green('✓ Emergency stop deactivated'));
    console.log(chalk.green('✓ API operations resumed'));
  });

emergencyCommands
  .command('status')
  .description('Check emergency stop status')
  .action(() => {
    const state = configManager.getEmergencyStopState();
    
    if (state.active) {
      console.log(chalk.red.bold('🚨 EMERGENCY STOP IS ACTIVE'));
      console.log(chalk.red(`Activated: ${state.activatedAt}`));
      console.log(chalk.red(`Reason: ${state.reason}`));
      console.log(chalk.yellow(`Pending transactions on hold: ${state.pendingTransactions.length}`));
    } else {
      console.log(chalk.green('✓ Emergency stop is inactive'));
      console.log(chalk.gray('All operations normal'));
    }
  });

emergencyCommands
  .command('kill-all')
  .description('Kill all pending transactions (use with caution)')
  .option('-f, --force', 'Force without confirmation')
  .action((options) => {
    const pending = transactionManager.getPendingTransactions();
    
    if (pending.length === 0) {
      console.log(chalk.yellow('No pending transactions to kill'));
      return;
    }
    
    console.log(chalk.red.bold(`⚠️  About to kill ${pending.length} pending transactions`));
    
    if (!options.force) {
      console.log(chalk.yellow('Use --force to confirm'));
      return;
    }
    
    const cancelled = transactionManager.cancelAllPending();
    console.log(chalk.green(`✓ Killed ${cancelled} transactions`));
  });