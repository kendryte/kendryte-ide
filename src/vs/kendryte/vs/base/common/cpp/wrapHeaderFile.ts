import { DONT_MODIFY_MARKER } from 'vs/base/common/messages';

export function wrapHeaderFile(code: string, constName: string) {
	return `// ${DONT_MODIFY_MARKER}
#ifndef _${constName}_H
#define _${constName}_H

${code}

#endif // _${constName}_H
`;
}