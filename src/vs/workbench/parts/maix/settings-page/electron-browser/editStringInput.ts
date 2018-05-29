import { ExplorerItem } from 'vs/workbench/parts/files/common/explorerModel';
import { TPromise } from 'vs/base/common/winjs.base';
import { IHighlightEvent, ITree } from 'vs/base/parts/tree/browser/tree';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { BaseErrorReportingAction, IFileViewletState } from 'vs/workbench/parts/files/electron-browser/fileActions';
import { localize } from 'vs/nls';
import * as errors from 'vs/base/common/errors';

export const TRIGGER_EDIT_LABEL = localize('edit', 'Edit');

export class TriggerEditItemAction extends BaseErrorReportingAction {

	public static readonly ID = 'editItem';

	constructor(
		private tree: ITree,
		element: string,
		@INotificationService notificationService: INotificationService,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super(TriggerEditItemAction.ID, TRIGGER_EDIT_LABEL, notificationService);
	}

	public run(context?: any): TPromise<any> {
		if (!context) {
			return TPromise.wrapError(new Error('No context provided to TriggerEditItemAction.'));
		}

		const viewletState = <IFileViewletState>context.viewletState;
		if (!viewletState) {
			return TPromise.wrapError(new Error('Invalid viewlet state provided to TriggerEditItemAction.'));
		}

		const stat = <ExplorerItem>context.stat;
		if (!stat) {
			return TPromise.wrapError(new Error('Invalid stat provided to TriggerEditItemAction.'));
		}

		viewletState.setEditable(stat, {
			action: '' as any,
			validator: (value) => {
				/*const message = this.validateFileName(value);

				if (!message) {
					return null;
				}

				return {
					content: message,
					formatContent: true,
					type: MessageType.ERROR
				};*/
				return null;
			}
		});

		this.tree.refresh(stat, false).then(() => {
			this.tree.setHighlight(stat);

			const unbind = this.tree.onDidChangeHighlight((e: IHighlightEvent) => {
				if (!e.highlight) {
					viewletState.clearEditable(stat);
					this.tree.refresh(stat).done(null, errors.onUnexpectedError);
					unbind.dispose();
				}
			});
		}).done(null, errors.onUnexpectedError);

		return void 0;
	}
}