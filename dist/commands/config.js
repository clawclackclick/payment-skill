"use strict";
/**
 * Payment Skill - Config Commands
 *
 * Configuration management CLI commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../core/config");
exports.configCommands = new commander_1.Command('config')
    .description('Manage payment-skill configuration');
exports.configCommands
    .command('get')
    .description('Get configuration value')
    .argument('<key>', 'Configuration key')
    .action((key) => {
    const config = config_1.configManager.getConfig();
    const value = config[key];
    if (value !== undefined) {
        console.log(JSON.stringify(value, null, 2));
    }
    else {
        console.log(chalk_1.default.yellow(`Key '${key}' not found`));
    }
});
exports.configCommands
    .command('set')
    .description('Set configuration value')
    .argument('<key>', 'Configuration key')
    .argument('<value>', 'Configuration value')
    .action((key, value) => {
    try {
        const parsedValue = JSON.parse(value);
        config_1.configManager.setConfig(key, parsedValue);
        console.log(chalk_1.default.green(`✓ Set ${key} = ${value}`));
    }
    catch {
        config_1.configManager.setConfig(key, value);
        console.log(chalk_1.default.green(`✓ Set ${key} = ${value}`));
    }
});
exports.configCommands
    .command('list')
    .description('List all configuration')
    .action(() => {
    const config = config_1.configManager.getConfig();
    console.log(chalk_1.default.blue('Configuration:'));
    console.log(JSON.stringify(config, null, 2));
});
exports.configCommands
    .command('init')
    .description('Initialize configuration')
    .action(() => {
    console.log(chalk_1.default.blue('Initializing payment-skill configuration...'));
    console.log(chalk_1.default.green('✓ Configuration initialized'));
    console.log(chalk_1.default.gray('Use "payment-skill provider add" to configure providers'));
});
exports.configCommands
    .command('path')
    .description('Show configuration file path')
    .action(() => {
    const path = require('path').join(process.env.HOME || process.env.USERPROFILE || '.', '.payment-skill', 'config.json');
    console.log(path);
});
//# sourceMappingURL=config.js.map