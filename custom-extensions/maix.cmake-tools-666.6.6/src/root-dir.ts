import * as path from 'path';
import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import { debug, log } from './log';

let ROOT = '';

export function getPackagesRoot() {
  if (!ROOT) {
    throw new Error('plugin has not ready');
  }
  return ROOT;
}

function mkdir(f: string) {
  return new Promise((resolve, reject) => {
    const wrappedCallback = (err: Error) => err? reject(err) : resolve();
    fs.mkdir(f, wrappedCallback);
  });
}

export async function isFile(f: string) {
  return new Promise<boolean>(resolve => {
    const wrappedCallback = (err: Error, data: fs.Stats) => err? resolve(false) : resolve(data.isFile());
    fs.lstat(f, wrappedCallback);
  });
}

async function exists(f: string) {
  return new Promise<boolean>(resolve => {
    const wrappedCallback = (err: Error, data: fs.Stats) => err? resolve(false) : resolve(data.isFile() || data.isDirectory() || data.isSymbolicLink());
    fs.lstat(f, wrappedCallback);
  });
}

async function createPackageFolder() {
  const pkgDir = getPackagesRoot();
  if (!await exists(pkgDir)) {
    await mkdir(pkgDir);
  }
}

/** yee, very safe */
export async function safeEnsurePackagesRootDir(): Promise<void> {
  if (ROOT) {
    return;
  }

  // release mode
  const wantExe = os.platform() === 'win32'? 'Maix IDE.exe' : 'maix-ide';
  const rootDir1 = path.resolve(vscode.env.appRoot, '../..', wantExe);
  log('detecting resolve root dir: %s', rootDir1);
  if (await exists(rootDir1)) {
    ROOT = path.resolve(rootDir1, '../packages/');
    log('found root dir: %s', ROOT);
    await createPackageFolder();
    return;
  }

  // debug mode
  const rootDir2 = path.resolve(vscode.env.appRoot, 'custom-extensions');
  debug('detecting debug root dir: %s', rootDir2);
  if (await exists(rootDir2)) {
    ROOT = path.resolve(rootDir2, '../packages/');
    debug('found root dir: %s', ROOT);
    await createPackageFolder();
    return;
  }

  log('not found root dir:\n1: %s\n2: %s', rootDir1, rootDir2);
  throw new Error(`Cannot find app executable [${wantExe}], please reinstall ide.`);
}