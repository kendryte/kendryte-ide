import { getChipPackaging } from 'vs/kendryte/vs/workbench/fpioaConfig/common/packagingRegistry';
import { SimpleJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/node/simpleJsonEditorModel';
import { DefaultChipName, IFPIOAFuncPinMap, IFPIOAMapData } from 'vs/kendryte/vs/base/common/jsonSchemas/deviceManagerSchema';

export class FpioaModel extends SimpleJsonEditorModel<IFPIOAMapData> {
	async _load() {
		if (!this.jsonData!.selectedChip) {
			this.update('selectedChip', DefaultChipName, true);
		}
	}

	get availableChips() {
		return getChipPackaging().map(item => item.name);
	}

	get isChipSelected(): boolean {
		return true;
	}

	get currentFuncMap(): Readonly<IFPIOAFuncPinMap> {
		return this.jsonData!.funcPinMap || {};
	}

	get currentChip(): string {
		return this.jsonData!.selectedChip || DefaultChipName;
	}

	setChip(name: string | undefined): boolean {
		if (this.currentChip === name) {
			return false;
		}
		this.update('selectedChip', name);
		return true;
	}

	unsetFunc(funcId: string): void {
		if (this.jsonData!.funcPinMap && this.jsonData!.funcPinMap.hasOwnProperty(funcId)) {
			this.update(['funcPinMap', funcId], undefined);
		}
	}

	setPinFunc(funcId: string, ioPin: string | undefined): boolean {
		console.log('[model] set io[%s] to func[%s]', ioPin, funcId);
		if (this.getFuncPin(funcId) === ioPin) {
			return false;
		}
		this.update(['funcPinMap', funcId], ioPin || undefined);
		return true;
	}

	getFuncPin(funcId: string): string | undefined {
		return this.jsonData!.funcPinMap ? this.jsonData!.funcPinMap[funcId] : undefined;
	}

	getPinFunc(ioPin: string | undefined): string | undefined {
		if (!this.jsonData!.funcPinMap) {
			return undefined;
		}
		for (const fn of Object.keys(this.jsonData!.funcPinMap)) {
			if (ioPin === this.jsonData!.funcPinMap[fn]) {
				return fn;
			}
		}
		return undefined;
	}

	getPinMap(): Readonly<IFPIOAFuncPinMap> {
		return this.jsonData!.funcPinMap;
	}
}