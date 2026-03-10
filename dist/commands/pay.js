"use strict";
/**
 * Payment Skill - Pay Command
 *
 * Execute payment using templates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
exports.payCommand = new commander_1.Command('pay')
    .description('Execute a payment using a template')
    .requiredOption('-t, --template <id>', 'Template ID')
    .requiredOption('--amount <amount>', 'Payment amount')
    .requiredOption('--currency <currency>', 'Currency code')
    .option('--destination <id>', 'Destination account/merchant ID')
    .option('--reference <text>', 'Payment reference')
    .option('--description <text>', 'Payment description')
    .action((options) => {
    console.log(chalk_1.default.blue('Executing payment...'));
    console.log(`  Template: ${options.template}`);
    console.log(`  Amount: ${options.amount} ${options.currency}`);
    if (options.destination)
        console.log(`  Destination: ${options.destination}`);
    if (options.reference)
        console.log(`  Reference: ${options.reference}`);
    console.log(chalk_1.default.yellow('\nTemplate-based payments not yet fully implemented'));
    console.log(chalk_1.default.gray('Use provider-specific commands:'));
    console.log(chalk_1.default.gray('  payment-skill wise transfer ...'));
    console.log(chalk_1.default.gray('  payment-skill bunq pay ...'));
});
//# sourceMappingURL=pay.js.map