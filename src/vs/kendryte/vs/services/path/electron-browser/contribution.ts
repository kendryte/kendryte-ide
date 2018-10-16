import { NodePathService } from 'vs/kendryte/vs/services/path/node/nodePathService';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { INodePathService } from 'vs/kendryte/vs/services/path/common/type';

registerSingleton(INodePathService, NodePathService);