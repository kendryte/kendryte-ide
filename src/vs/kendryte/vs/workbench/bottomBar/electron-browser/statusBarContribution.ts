import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { IKendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { KendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/kendryteStatusControllerService';

registerSingleton(IKendryteStatusControllerService, KendryteStatusControllerService);
