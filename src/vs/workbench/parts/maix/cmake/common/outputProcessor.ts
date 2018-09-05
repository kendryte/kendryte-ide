import { Severity } from 'vs/platform/notification/common/notification';
import { IMarkerData, IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import URI from 'vs/base/common/uri';
import { TextProgressBar } from 'vs/workbench/parts/maix/_library/common/textProgressBar';
import { StatusBarController } from 'vs/workbench/parts/maix/cmake/common/statusBarController';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { IWorkspaceContextService, IWorkspaceFolder } from 'vs/platform/workspace/common/workspace';
import { normalize } from 'path';
import { isAbsolute } from 'vs/base/common/paths';
import { isWindows } from 'vs/base/common/platform';
import { escapeRegExpCharacters } from 'vs/base/common/strings';
import { normalizePosixPath } from 'vs/workbench/parts/maix/_library/node/resolvePath';

const regGCCError = /^(.*?):(\d+):(\d+):\s+(\w*)(?:\sfatale)?\s?:\s+(.*)/;
const regCMakeProgress = /^\[\s*(\d+)%]/;

export class CMakeProcessList implements IDisposable {
	constructor(
		private pros: CMakeProcessor[],
	) {
	}

	parseLine(line: string) {
		CMakeProcessor.parseLine(line, this.pros);
	}

	finalize() {
		for (const obj of this.pros) {
			obj.finalize();
		}
	}

	dispose() {
		dispose(this.pros);
	}
}

export abstract class CMakeProcessor implements IDisposable {
	protected abstract onData(line: string): boolean;

	public static parseLine(line: string, processors: CMakeProcessor[]) {
		for (const item of processors) {
			if (item.onData(line)) {
				break;
			}
		}
	}

	abstract finalize(): void;

	abstract dispose(): void;
}

interface MarkerStore {
	uri: URI,
	markers: IMarkerData[]
}

export class CMakeBuildErrorProcessor extends CMakeProcessor {
	private readonly errorMarkers: Map<string, MarkerStore> = new Map();
	private cwd: IWorkspaceFolder;

	constructor(
		@IMarkerService protected markerService: IMarkerService,
		@IWorkspaceContextService protected workspaceContextService: IWorkspaceContextService,
	) {
		super();
		this.cwd = workspaceContextService.getWorkspace().folders[0];
	}

	protected onData(line: string) {
		const m2 = regGCCError.exec(line);
		if (m2) {
			this.diagnostic(m2[4], m2[5], m2[1], m2[2], m2[3]);
		}
		return !!m2;
	}

	protected diagnostic(_severity: string, message: string, file: string, _line: string, _column: string) {
		let severity = MarkerSeverity.fromSeverity(Severity.fromValue(_severity)) || MarkerSeverity.Info;
		if (severity === MarkerSeverity.Hint) {
			severity = MarkerSeverity.Info;
		}
		const errorMarkers = this.errorMarkers;

		const line = parseInt(_line);
		const column = parseInt(_column);

		if (isWindows) {

		}
		file = normalize(file);
		const cwd = this.cwd.uri.fsPath;
		if (isAbsolute(file)) {
			if (isWindows) {
				const reg = new RegExp('^' + escapeRegExpCharacters(cwd), 'i');
				if (reg.test(file)) {
					file = file.replace(reg, '').replace(/^[\\\/]+/, '');
				}
			} else if (file.indexOf(cwd) === 0) {
				file = file.replace(cwd, '').replace(/^\/+/, '');
			}
		}
		file = normalizePosixPath(file);

		if (!errorMarkers.has(file)) {
			let fileRes: URI;

			if (isAbsolute(file)) {
				if (isWindows) {
					file = normalizePosixPath('/' + file);
				}
				fileRes = URI.parse('file://' + file);
			} else {
				fileRes = this.cwd.toResource(file);
			}
			errorMarkers.set(file, { uri: fileRes, markers: [] });
		}
		errorMarkers.get(file).markers.push({
			message,
			severity,
			file,
			startLineNumber: line,
			startColumn: column,
			endLineNumber: line,
			endColumn: column,
		} as IMarkerData);
	}

	public finalize() {
		for (const { uri, markers } of Array.from<MarkerStore>(this.errorMarkers.values())) {
			this.markerService.changeOne('cmake/build', uri, markers);
		}
	}

	public dispose() {
		this.markerService.changeAll('cmake/build', []);
	}
}

export class CMakeBuildProgressProcessor extends CMakeProcessor {
	private bar: TextProgressBar;

	constructor(
		protected statusBarController: StatusBarController,
	) {
		super();
		this.bar = new TextProgressBar(20);
		this.bar.infinite();
	}

	protected onData(line: string) {
		const m1 = regCMakeProgress.exec(line);
		if (m1) {
			this.bar.percent(parseInt(m1[1]));
			this.statusBarController.showMessage(this.bar.toString());
		}
		return !!m1;
	}

	finalize(): void {
		this.bar.dispose();
	}

	dispose(): void {
		this.statusBarController.showMessage('');
	}
}