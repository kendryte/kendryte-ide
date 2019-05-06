import { registerSingleton } from 'vs/platform/instantiation/common/extensions';
import { ICustomJsonEditorService, IJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/type';
import { URI } from 'vs/base/common/uri';
import { CustomJsonRegistry } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/register';
import { SimpleJsonEditorModel } from 'vs/kendryte/vs/workbench/jsonGUIEditor/service/common/simpleJsonEditorModel';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INodeFileSystemService } from 'vs/kendryte/vs/services/fileSystem/common/type';
import { IMarkerService } from 'vs/platform/markers/common/markers';
import { ITextFileService } from 'vs/workbench/services/textfile/common/textfiles';
import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IFileService } from 'vs/platform/files/common/files';
import * as encoding from 'vs/base/node/encoding';
import { JsonEditorFocusContext, JsonEditorFocusIdContext } from 'vs/kendryte/vs/workbench/jsonGUIEditor/common/type';
import { IContextKey, IContextKeyService } from 'vs/platform/contextkey/common/contextkey';

class CustomJsonEditorService implements ICustomJsonEditorService {
	public _serviceBrand: any;

	private focusList = new Set<string>();
	private readonly referenceMap = new Map<string, IJsonEditorModel<any>>();

	private readonly jsonEditorFocusContext: IContextKey<boolean>;
	private readonly jsonEditorFocusIdContext: IContextKey<string>;

	constructor(
		@IInstantiationService private instantiationService: IInstantiationService,
		@INodeFileSystemService protected readonly nodeFileSystemService: INodeFileSystemService,
		@IMarkerService protected readonly markerService: IMarkerService,
		@ITextFileService private textFileService: ITextFileService,
		@ITextModelService private readonly textModelResolverService: ITextModelService,
		@IFileService private readonly fileService: IFileService,
		@IContextKeyService contextKeyService: IContextKeyService,
	) {
		this.jsonEditorFocusContext = JsonEditorFocusContext.bindTo(contextKeyService);
		this.jsonEditorFocusIdContext = JsonEditorFocusIdContext.bindTo(contextKeyService);
	}

	createJsonModel(resource: URI) {
		const path = resource.fsPath;
		if (this.referenceMap.has(path)) {
			return this.referenceMap.get(path)!;
		}

		const id = CustomJsonRegistry.matchPath(resource);
		if (!id) {
			return undefined;
		}

		const jsonModel = this.instantiationService.createInstance(SimpleJsonEditorModel, id, resource);

		this.referenceMap.set(resource.fsPath, jsonModel);

		jsonModel.onDispose(() => {
			this.referenceMap.delete(resource.fsPath);
		});

		return jsonModel;
	}

	async createTextReference(editorId: string, resource: URI) {
		const exists = await this.fileService.exists(resource);
		if (!exists) {
			const schema = CustomJsonRegistry.getSchemaById(editorId);
			if (schema) {
				await this.textFileService.write(resource, JSON.stringify(schema.default), { encoding: encoding.UTF8 });
			} else {
				await this.textFileService.write(resource, '{}', { encoding: encoding.UTF8 });
			}
		}
		return await this.textModelResolverService.createModelReference(resource);
	}

	openEditorAs(resource: URI, editorId: string) {
		const inputCtor = CustomJsonRegistry.getEditorInputById(editorId);
		return this.instantiationService.createInstance(inputCtor, resource);
	}

	updateFocus(id: string, focus: boolean) {
		if (focus) {
			this.focusList.add(id);
			if (this.focusList.size === 1) {
				this.jsonEditorFocusContext.set(true);
			}
			this.jsonEditorFocusIdContext.set(id);
		} else {
			this.focusList.delete(id);
			if (this.focusList.size === 0) {
				this.jsonEditorFocusContext.set(false);
				this.jsonEditorFocusIdContext.set('');
			} else {
				this.jsonEditorFocusIdContext.set(this.focusList.values().next().value);
			}
		}
	}
}

registerSingleton(ICustomJsonEditorService, CustomJsonEditorService);