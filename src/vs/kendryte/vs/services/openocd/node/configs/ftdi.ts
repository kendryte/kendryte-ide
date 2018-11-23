import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/extendWithCategory';
import {
	CONFIG_CATEGORY,
	CONFIG_DESCRIPTION_FTDI_EXTRA,
	CONFIG_DESCRIPTION_FTDI_LAYOUT,
	CONFIG_DESCRIPTION_FTDI_SPEED,
	CONFIG_DESCRIPTION_FTDI_TDO_FE,
	CONFIG_KEY_FTDI_EXTRA,
	CONFIG_KEY_FTDI_LAYOUT,
	CONFIG_KEY_FTDI_SPEED,
	CONFIG_KEY_FTDI_TDO_FE,
} from 'vs/kendryte/vs/base/common/configKeys';

export interface FtdiConfigExtra {
	speed: number;
	layoutInit: [string, string];
	tdoSampleFallingEdge: boolean;
	extra: string;
}

const defaultValue: FtdiConfigExtra = {
	speed: 25000,
	layoutInit: ['0x00e8', '0x00eb'],
	tdoSampleFallingEdge: true,
	extra: '',
};

registerConfiguration({
	id: 'ftdi',
	category: CONFIG_CATEGORY.DEBUG_FTDI.id,
	properties: {
		[CONFIG_KEY_FTDI_SPEED]: {
			description: CONFIG_DESCRIPTION_FTDI_SPEED,
			type: 'string',
			default: defaultValue.speed,
		},
		[CONFIG_KEY_FTDI_LAYOUT]: {
			description: CONFIG_DESCRIPTION_FTDI_LAYOUT,
			type: 'array',
			items: [
				{
					'type': 'string',
				}, {
					'type': 'string',
				},
			],
			minItems: 2,
			maxItems: 2,
			default: defaultValue.layoutInit,
		},
		[CONFIG_KEY_FTDI_TDO_FE]: {
			description: CONFIG_DESCRIPTION_FTDI_TDO_FE,
			type: 'string',
			default: defaultValue.tdoSampleFallingEdge,
		},
		[CONFIG_KEY_FTDI_EXTRA]: {
			description: CONFIG_DESCRIPTION_FTDI_EXTRA,
			type: 'string',
			default: defaultValue.extra,
		},
	},
});

export function createDefaultFtdiConfig(port: number, config: FtdiConfigExtra) {
	return `
interface ftdi
# for canaan's ftdi
ftdi_vid_pid 0x0403 0x6014
ftdi_layout_init ${config.layoutInit[0]} ${config.layoutInit[1]}
${config.extra}

transport select jtag
${config.tdoSampleFallingEdge ? '' : '# '}ftdi_tdo_sample_edge falling
adapter_khz ${config.speed}
gdb_port ${port}
tcl_port ${port + 1}
telnet_port ${port + 2}
set _CHIPNAME riscv
jtag newtap $_CHIPNAME cpu -irlen 5 -expected-id 0x04e4796b
set _TARGETNAME $_CHIPNAME.cpu
target create $_TARGETNAME riscv -chain-position $_TARGETNAME
init
halt
`.trim() + '\n';
}


