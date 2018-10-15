import { IUpdateService } from 'vs/platform/update/common/update';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { SelfUpdateService } from 'vs/kendryte/vs/services/update/node/selfUpdateService';
import 'vs/kendryte/vs/services/update/electron-browser/renderVersionUrlHandler';

registerSingleton(IUpdateService, SelfUpdateService);
