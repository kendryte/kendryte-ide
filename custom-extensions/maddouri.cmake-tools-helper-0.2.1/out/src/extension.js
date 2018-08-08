'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const state = require("./state");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let cmakeToolsHelper = new state.CMakeToolsHelper();
    function registerCommand(cmdName) {
        // nice trick :)
        // https://github.com/vector-of-bool/vscode-cmake-tools/blob/0.9.4/src/extension.ts
        let fn = cmakeToolsHelper[cmdName].bind(cmakeToolsHelper);
        context.subscriptions.push(vscode.commands.registerCommand('cmake.' + cmdName, _ => fn()));
    }
    [
        'show_active_cmake_config_name',
        'update_cpptools',
        'install_cmake',
        'change_cmake_version'
    ].forEach(cmdName => registerCommand(cmdName));
    return cmakeToolsHelper;
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map