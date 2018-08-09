'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as helper from './helper';
import * as state from './state';
import * as console from './log';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): state.CMakeToolsHelper {

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
    ].forEach(cmdName =>
        registerCommand(cmdName)
    );

    return cmakeToolsHelper;
}

// this method is called when your extension is deactivated
export function deactivate() {
}