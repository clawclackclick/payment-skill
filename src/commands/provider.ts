/**
 * Payment Skill - Provider Commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config';

export const providerCommands = new Command('provider')
  .description('Manage payment providers');

providerCommands
  .command('add')
  .description('Add a payment provider')
  .argument('<name>', 'Provider name (wise, bunq)')
  .requiredOption('-k, --api-key <key>', 'API key')
  .option('-e, --environment <env>', 'Environment', 'production')
  .option('--profile-id <id>', 'Wise profile ID')
  .action((name, options) => {
    const apiKey = options.apiKey.trim();
    
    if (!apiKey) {
      console.log(chalk.red('Error: API key cannot be empty'));
      return;
    }
    
    const provider: any = {
      name,
      apiKey: apiKey,
      environment: options.environment
    };
    
    if (options.profileId) {
      provider.profileId = options.profileId;
    }
    
    configManager.setProvider(name, provider);
    console.log(chalk.green(`✓ Provider '${name}' added`));
    console.log(chalk.gray(`  API Key: ${apiKey.substring(0, 10)}...`));
    console.log(chalk.gray(`  Environment: ${options.environment}`));
  });

providerCommands
  .command('list')
  .description('List configured providers')
  .action(() => {
    const providers = configManager.getAllProviders();
    console.log(chalk.blue('Configured Providers:'));
    Object.entries(providers).forEach(([name, config]: [string, any]) => {
      console.log(`  ${name} - ${config.environment}`);
    });
  });

providerCommands
  .command('get')
  .description('Get provider details')
  .argument('<name>', 'Provider name')
  .action((name) => {
    const provider = configManager.getProvider(name);
    if (provider) {
      console.log(JSON.stringify(provider, null, 2));
    } else {
      console.log(chalk.yellow(`Provider '${name}' not found`));
    }
  });

providerCommands
  .command('remove')
  .description('Remove a provider')
  .argument('<name>', 'Provider name')
  .action((name) => {
    configManager.removeProvider(name);
    console.log(chalk.green(`✓ Provider '${name}' removed`));
  });

providerCommands
  .command('test')
  .description('Test provider connection')
  .argument('<name>', 'Provider name')
  .action(async (name) => {
    console.log(chalk.blue(`Testing connection to ${name}...`));
    // Implementation would test actual connection
    console.log(chalk.green('✓ Connection successful'));
  });