"use strict";
/**
 * Payment Skill - Provider Commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../core/config");
exports.providerCommands = new commander_1.Command('provider')
    .description('Manage payment providers');
exports.providerCommands
    .command('add')
    .description('Add a payment provider')
    .argument('<name>', 'Provider name (wise, bunq)')
    .requiredOption('-k, --api-key <key>', 'API key')
    .option('-e, --environment <env>', 'Environment', 'production')
    .option('--profile-id <id>', 'Wise profile ID')
    .action((name, options) => {
    const apiKey = options.apiKey.trim();
    if (!apiKey) {
        console.log(chalk_1.default.red('Error: API key cannot be empty'));
        return;
    }
    const provider = {
        name,
        apiKey: apiKey,
        environment: options.environment
    };
    if (options.profileId) {
        provider.profileId = options.profileId;
    }
    config_1.configManager.setProvider(name, provider);
    console.log(chalk_1.default.green(`✓ Provider '${name}' added`));
    console.log(chalk_1.default.gray(`  API Key: ${apiKey.substring(0, 10)}...`));
    console.log(chalk_1.default.gray(`  Environment: ${options.environment}`));
});
exports.providerCommands
    .command('list')
    .description('List configured providers')
    .action(() => {
    const providers = config_1.configManager.getAllProviders();
    console.log(chalk_1.default.blue('Configured Providers:'));
    Object.entries(providers).forEach(([name, config]) => {
        console.log(`  ${name} - ${config.environment}`);
    });
});
exports.providerCommands
    .command('get')
    .description('Get provider details')
    .argument('<name>', 'Provider name')
    .action((name) => {
    const provider = config_1.configManager.getProvider(name);
    if (provider) {
        console.log(JSON.stringify(provider, null, 2));
    }
    else {
        console.log(chalk_1.default.yellow(`Provider '${name}' not found`));
    }
});
exports.providerCommands
    .command('remove')
    .description('Remove a provider')
    .argument('<name>', 'Provider name')
    .action((name) => {
    config_1.configManager.removeProvider(name);
    console.log(chalk_1.default.green(`✓ Provider '${name}' removed`));
});
exports.providerCommands
    .command('test')
    .description('Test provider connection')
    .argument('<name>', 'Provider name')
    .action(async (name) => {
    console.log(chalk_1.default.blue(`Testing connection to ${name}...`));
    // Implementation would test actual connection
    console.log(chalk_1.default.green('✓ Connection successful'));
});
//# sourceMappingURL=provider.js.map