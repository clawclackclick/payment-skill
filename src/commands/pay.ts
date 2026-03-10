/**
 * Payment Skill - Pay Command
 * 
 * Execute payment using templates
 */

import { Command } from 'commander';
import chalk from 'chalk';

export const payCommand = new Command('pay')
  .description('Execute a payment using a template')
  .requiredOption('-t, --template <id>', 'Template ID')
  .requiredOption('--amount <amount>', 'Payment amount')
  .requiredOption('--currency <currency>', 'Currency code')
  .option('--destination <id>', 'Destination account/merchant ID')
  .option('--reference <text>', 'Payment reference')
  .option('--description <text>', 'Payment description')
  .action((options) => {
    console.log(chalk.blue('Executing payment...'));
    console.log(`  Template: ${options.template}`);
    console.log(`  Amount: ${options.amount} ${options.currency}`);
    if (options.destination) console.log(`  Destination: ${options.destination}`);
    if (options.reference) console.log(`  Reference: ${options.reference}`);
    
    console.log(chalk.yellow('\nTemplate-based payments not yet fully implemented'));
    console.log(chalk.gray('Use provider-specific commands:'));
    console.log(chalk.gray('  payment-skill wise transfer ...'));
    console.log(chalk.gray('  payment-skill bunq pay ...'));
  });