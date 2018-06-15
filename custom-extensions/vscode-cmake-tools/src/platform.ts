import { platform } from 'os';

const ext = platform() === 'win32'? '.exe' : '';

export function concatBinaryPath(binDir: string, command: string) {
  return `${binDir}/riscv64-unknown-elf-${command}${ext}`;
}

