import { Extensions as PanelExtensions, PanelDescriptor, PanelRegistry } from 'vs/workbench/browser/panel';
import { Registry } from 'vs/platform/registry/common/platform';
import * as nls from 'vs/nls';
import { SerialPortActionId } from 'vs/workbench/parts/maix/serialPort/common/type';
import { SERIAL_PANEL_ID, SerialMonitPanel } from 'vs/workbench/parts/maix/serialPort/electron-browser/panel/panel';

Registry.as<PanelRegistry>(PanelExtensions.Panels).registerPanel(new PanelDescriptor(
	SerialMonitPanel,
	SERIAL_PANEL_ID,
	nls.localize('serial', 'Serial'),
	'serial',
	100,
	SerialPortActionId,
));

