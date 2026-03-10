"use strict";
/**
 * Payment Skill - Server Commands
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverCommands = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
exports.serverCommands = new commander_1.Command('server')
    .description('Server management');
exports.serverCommands
    .command('serve', { isDefault: true })
    .description('Start the dashboard server')
    .option('-p, --port <port>', 'Port number', '8080')
    .option('-h, --host <host>', 'Host address', 'localhost')
    .action((options) => {
    console.log(chalk_1.default.blue(`Starting server on ${options.host}:${options.port}...`));
    console.log(chalk_1.default.yellow('Server implementation not yet complete'));
    console.log(chalk_1.default.gray('Dashboard is available at dashboard.html'));
});
exports.serverCommands
    .command('stop')
    .description('Stop the server')
    .action(() => {
    console.log(chalk_1.default.blue('Stopping server...'));
    console.log(chalk_1.default.yellow('Server stop not yet implemented'));
});
exports.serverCommands
    .command('status')
    .description('Check server status')
    .action(() => {
    console.log(chalk_1.default.yellow('Server status check not yet implemented'));
});
//# sourceMappingURL=server.js.map