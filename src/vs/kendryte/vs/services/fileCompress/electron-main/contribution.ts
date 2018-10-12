import { FileCompressService, IFileCompressService } from 'vs/kendryte/vs/services/fileCompress/node/fileCompressService';
import { registerMainSingleton } from 'vs/kendryte/vs/platform/instantiation/common/mainExtensions';

registerMainSingleton(IFileCompressService, FileCompressService);
