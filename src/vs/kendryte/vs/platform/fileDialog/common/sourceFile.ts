import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { CONFIG_KEY_SOURCE_TYPES } from 'vs/kendryte/vs/platform/fileDialog/common/configKeys';
import { FileFilter } from 'vs/platform/windows/common/windows';
import { localize } from 'vs/nls';

export function createSourceFilter(configurationService: IConfigurationService): FileFilter {
	const types = getSourceFileExtensions(configurationService);

	return {
		extensions: types,
		name: localize('sourceFilesType', 'Source files') + types.map(e => `*.${e}`).join(','),
	};
}

export function getSourceFileExtensions(configurationService: IConfigurationService) {
	return configurationService.getValue<string>(CONFIG_KEY_SOURCE_TYPES).split(';').map(e => e.trim()).filter(e => e);
}
