import { CONFIG_CATEGORY, CONFIG_DESCRIPTION_JTAG_ID, CONFIG_DESCRIPTION_JTAG_SPEED, CONFIG_KEY_JTAG_ID, CONFIG_KEY_JTAG_SPEED, } from 'vs/kendryte/vs/base/common/configKeys';
import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';

export interface JTagConfigExtra {
	speed: number;
	serialNumber: number;
}

const defaultValue: JTagConfigExtra = {
	speed: 30000,
	serialNumber: 0,
};

registerConfiguration({
	id: 'jtag',
	category: CONFIG_CATEGORY.DEBUG_JTAG.id,
	properties: {
		[CONFIG_KEY_JTAG_ID]: {
			description: CONFIG_DESCRIPTION_JTAG_ID,
			type: 'number',
			default: defaultValue.serialNumber,
			minimum: 0,
		},
		[CONFIG_KEY_JTAG_SPEED]: {
			description: CONFIG_DESCRIPTION_JTAG_SPEED,
			type: 'number',
			default: defaultValue.speed,
			minimum: 1,
		},
	},
});

export async function createDefaultJTagConfig(port: number, options: JTagConfigExtra) {
	return `# debug adapter
interface jlink
${options.serialNumber > 0 ? '' : '# '}jlink serial ${options.serialNumber}
transport select jtag
adapter_khz ${options.speed}
gdb_port ${port}
tcl_port ${port+1}
telnet_port ${port+2}
set _CHIPNAME riscv
jtag newtap $_CHIPNAME cpu -irlen 5 -expected-id 0x04e4796b
set _TARGETNAME $_CHIPNAME.cpu
target create $_TARGETNAME riscv -chain-position $_TARGETNAME
init
halt
`.trim() + '\n';
}