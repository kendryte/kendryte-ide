import { ISudoService, SudoService } from 'vs/kendryte/vs/platform/sudo/node/sudoService';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';

registerMainSingleton(ISudoService, SudoService);
