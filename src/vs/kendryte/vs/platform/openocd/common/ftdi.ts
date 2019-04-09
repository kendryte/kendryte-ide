import { registerConfiguration } from 'vs/kendryte/vs/platform/config/common/registry';
import {
	CONFIG_CATEGORY,
	CONFIG_DESCRIPTION_FTDI_EXTRA,
	CONFIG_DESCRIPTION_FTDI_LAYOUT,
	CONFIG_DESCRIPTION_FTDI_SPEED,
	CONFIG_DESCRIPTION_FTDI_TDO_FE,
	CONFIG_DESCRIPTION_FTDI_VID_PID,
	CONFIG_KEY_FTDI_EXTRA,
	CONFIG_KEY_FTDI_LAYOUT,
	CONFIG_KEY_FTDI_SPEED,
	CONFIG_KEY_FTDI_TDO_FE,
	CONFIG_KEY_FTDI_VID_PID,
} from 'vs/kendryte/vs/base/common/configKeys';

export interface FtdiConfigExtra {
	speed: number;
	layoutInit: string;
	vidPid: string;
	tdoSampleFallingEdge: boolean;
	extra: string;
}

const defaultValue: FtdiConfigExtra = {
	speed: 25000,
	layoutInit: '00e8 00eb',
	vidPid: '0403 6014',
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
		[CONFIG_KEY_FTDI_VID_PID]: {
			description: CONFIG_DESCRIPTION_FTDI_VID_PID,
			type: 'string',
			pattern: '^[0-9a-fA-F]{4} [0-9a-fA-F]{4}$',
			default: defaultValue.vidPid,
		},
		[CONFIG_KEY_FTDI_LAYOUT]: {
			description: CONFIG_DESCRIPTION_FTDI_LAYOUT,
			type: 'string',
			pattern: '^[0-9a-fA-F]{4} [0-9a-fA-F]{4}$',
			default: defaultValue.layoutInit,
		},
		[CONFIG_KEY_FTDI_TDO_FE]: {
			description: CONFIG_DESCRIPTION_FTDI_TDO_FE,
			type: 'boolean',
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
	const [vid1, vid2] = config.vidPid.split(/\s/);
	const [lay1, lay2] = config.layoutInit.split(/\s/);
	return `
interface ftdi
# for canaan's ftdi
ftdi_vid_pid 0x${vid1} 0x${vid2}
ftdi_layout_init 0x${lay1} 0x${lay2}
${config.extra}

transport select jtag
${config.tdoSampleFallingEdge ? '' : '# '}ftdi_tdo_sample_edge falling
adapter_khz 3000
gdb_port ${port}
tcl_port ${port + 1}
telnet_port ${port + 2}
set _CHIPNAME riscv
jtag newtap $_CHIPNAME cpu -irlen 5 -expected-id 0x04e4796b
set _TARGETNAME $_CHIPNAME.cpu
target create $_TARGETNAME riscv -chain-position $_TARGETNAME
init

$_TARGETNAME configure -event reset-start {
    adapter_khz 100
}

$_TARGETNAME configure -event reset-init {
	adapter_khz ${config.speed}
}
`.trim() + '\n';
}

