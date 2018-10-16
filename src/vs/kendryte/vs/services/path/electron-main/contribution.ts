import { NodePathService } from 'vs/kendryte/vs/services/path/node/nodePathService';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';

registerMainSingleton(INodePathService, NodePathService);