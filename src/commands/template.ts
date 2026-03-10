/**
 * Payment Skill - Template Commands
 */

import { Command } from 'commander';
import chalk from 'chalk';

export const templateCommands = new Command('template')
  .description('Payment templates');

templateCommands
  .command('list')
  .description('List available templates')
  .option('-m, --merchant <merchant>', 'Filter by merchant')
  .action(() => {
    console.log(chalk.blue('Available Templates:'));
    console.log('  stripe_standard - Standard Stripe payment flow');
    console.log('  airwallex_standard - Standard Airwallex payment flow');
    console.log('  wise_transfer - Wise transfer flow');
    console.log('  bunq_payment - Bunq payment flow');
  });

templateCommands
  .command('get')
  .description('Get template details')
  .argument('<template-id>', 'Template ID')
  .action((templateId) => {
    console.log(chalk.blue(`Template: ${templateId}`));
    console.log(chalk.yellow('Template details not yet implemented'));
  });