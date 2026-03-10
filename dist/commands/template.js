"use strict";
/**
 * Payment Skill - Template Commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
exports.templateCommands = new commander_1.Command('template')
    .description('Payment templates');
exports.templateCommands
    .command('list')
    .description('List available templates')
    .option('-m, --merchant <merchant>', 'Filter by merchant')
    .action(() => {
    console.log(chalk_1.default.blue('Available Templates:'));
    console.log('  stripe_standard - Standard Stripe payment flow');
    console.log('  airwallex_standard - Standard Airwallex payment flow');
    console.log('  wise_transfer - Wise transfer flow');
    console.log('  bunq_payment - Bunq payment flow');
});
exports.templateCommands
    .command('get')
    .description('Get template details')
    .argument('<template-id>', 'Template ID')
    .action((templateId) => {
    console.log(chalk_1.default.blue(`Template: ${templateId}`));
    console.log(chalk_1.default.yellow('Template details not yet implemented'));
});
//# sourceMappingURL=template.js.map