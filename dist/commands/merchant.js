"use strict";
/**
 * Payment Skill - Merchant Commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
exports.merchantCommands = new commander_1.Command('merchant')
    .description('Merchant detection and management');
exports.merchantCommands
    .command('detect')
    .description('Detect merchant API capabilities')
    .argument('<domain>', 'Merchant domain')
    .action(async (domain) => {
    console.log(chalk_1.default.blue(`Detecting API capabilities for ${domain}...`));
    // Implementation would detect actual API
    console.log(chalk_1.default.yellow('Merchant detection not yet implemented'));
});
exports.merchantCommands
    .command('list-apis')
    .description('List supported merchant APIs')
    .action(() => {
    console.log(chalk_1.default.blue('Supported Merchant APIs:'));
    console.log('  - wise.com (Wise Platform)');
    console.log('  - bunq.com (Bunq API)');
    console.log('  - stripe.com (Stripe Connect)');
    console.log('  - airwallex.com (Airwallex API)');
});
exports.merchantCommands
    .command('capabilities')
    .description('Get merchant capabilities')
    .argument('<merchant-id>', 'Merchant ID')
    .action((merchantId) => {
    console.log(chalk_1.default.blue(`Capabilities for ${merchantId}:`));
    console.log(chalk_1.default.yellow('Not yet implemented'));
});
//# sourceMappingURL=merchant.js.map