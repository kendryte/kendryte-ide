import * as vscode from 'vscode';
import * as util from 'util';

const chan = vscode.window.createOutputChannel('cmake-tools-helper');

export function log(f: any, ...args: any[]) {
    if (typeof f === 'string') {
        console.log(util.format('[cmake-tools-helper] LOG: ' + f, ...args));
    } else {
        console.log(util.format('[cmake-tools-helper] LOG:', f, ...args));
    }
    chan.appendLine(util.format(f, ...args));
}

export function error(f: any, ...args: any[]) {
    if (typeof f === 'string') {
        console.error(util.format('[cmake-tools-helper] ERROR: ' + f, ...args));
    } else {
        console.error(util.format('[cmake-tools-helper] ERROR:', f, ...args));
    }
    chan.appendLine(util.format(f, ...args));
}

export function debug(f: any, ...args: any[]) {
    chan.appendLine(util.format(f, ...args));
}