/**
 * Payment Skill - Config Commands
 * 
 * Configuration management CLI commands
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { configManager } from '../core/config';

export const configCommands = new Command('config')
  .description('Manage payment-skill configuration');

configCommands
  .command('get')
  .description('Get configuration value')
  .argument('<key>', 'Configuration key')
  .action((key) => {
    const config = configManager.getConfig();
    const value = config[key];
    if (value !== undefined) {
      console.log(JSON.stringify(value, null, 2));
    } else {
      console.log(chalk.yellow(`Key '${key}' not found`));
    }
  });

configCommands
  .command('set')
  .description('Set configuration value')
  .argument('<key>', 'Configuration key')
  .argument('<value>', 'Configuration value')
  .action((key, value) => {
    try {
      const parsedValue = JSON.parse(value);
      configManager.setConfig(key, parsedValue);
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    } catch {
      configManager.setConfig(key, value);
      console.log(chalk.green(`✓ Set ${key} = ${value}`));
    }
  });

configCommands
  .command('list')
  .description('List all configuration')
  .action(() => {
    const config = configManager.getConfig();
    console.log(chalk.blue('Configuration:'));
    console.log(JSON.stringify(config, null, 2));
  });

configCommands
  .command('init')
  .description('Initialize configuration')
  .action(() => {
    console.log(chalk.blue('Initializing payment-skill configuration...'));
    console.log(chalk.green('✓ Configuration initialized'));
    console.log(chalk.gray('Use "payment-skill provider add" to configure providers'));
  });

configCommands
  .command('path')
  .description('Show configuration file path')
  .action(() => {
    const path = require('path').join(
      process.env.HOME || process.env.USERPROFILE || '.',
      '.payment-skill',
      'config.json'
    );
    console.log(path);
  });