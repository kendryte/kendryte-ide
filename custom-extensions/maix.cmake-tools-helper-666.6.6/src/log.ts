import * as vscode from 'vscode';
import * as util from 'util';

const chan = vscode.window.createOutputChannel('CMake/Build');

export function log(f: any, ...args: any[]) {
    console.log(f, ...args);
    if (typeof f === 'string') {
        chan.appendLine(util.format('[cmake-helper] LOG: ' + f, ...args));
    } else {
        chan.appendLine(util.format('[cmake-helper] LOG:', f, ...args));
    }
}

export function error(f: any, ...args: any[]) {
    console.error(f, ...args);
    if (typeof f === 'string') {
        chan.appendLine(util.format('[cmake-helper] ERROR: ' + f, ...args));
    } else {
        chan.appendLine(util.format('[cmake-helper] ERROR:', f, ...args));
    }
}

export function debug(...args: any[]) {
    console.log(...args);
}