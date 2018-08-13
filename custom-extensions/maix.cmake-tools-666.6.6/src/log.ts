import * as util from 'util';
import { channelManager } from '@cmt/logging';

const chan = channelManager.get('CMake/Build');

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