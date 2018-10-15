import 'vs/kendryte/vs/services/update/electron-main/mainVersionUrlHandler';
import { IUpdateService } from 'vs/platform/update/common/update';
import { SelfUpdateService } from 'vs/kendryte/vs/services/update/node/selfUpdateService';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';

registerMainSingleton(IUpdateService, SelfUpdateService);
