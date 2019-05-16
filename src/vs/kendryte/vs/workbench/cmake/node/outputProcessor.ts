import { Severity } from 'vs/platform/notification/common/notification';
import { IMarkerData, IMarkerService, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { TextProgressBar } from 'vs/kendryte/vs/base/common/textProgressBar';
import { dispose, IDisposable } from 'vs/base/common/lifecycle';
import { isAbsolute } from 'vs/base/common/path';
import { normalizePosixPath, resolvePath } from 'vs/kendryte/vs/base/common/resolvePath';
import { IKendryteStatusControllerService } from 'vs/kendryte/vs/workbench/bottomBar/common/type';
import { ExtendMap } from 'vs/kendryte/vs/base/common/extendMap';
import { CMAKE_ERROR_MARKER } from 'vs/kendryte/vs/workbench/cmake/common/type';
import { IKendryteWorkspaceService } from 'vs/kendryte/vs/services/workspace/common/type';
import { URI } from 'vs/base/common/uri';

const regLdMissingReference = /^(.*?):(\d+): (undefined reference to .+)$/;
const regGCCError = /^(.*?):(\d+):(\d+):\s+(\w*)(?:\serror|warning)?:\s+(.*)/;
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

export class CMakeBuildErrorProcessor extends CMakeProcessor {
	private readonly errorMarkers = new ExtendMap<string/* abs path */, IMarkerData[]>();
	private readonly currentProjectPath: string;

	constructor(
		@IMarkerService private readonly markerService: IMarkerService,
		@IKendryteWorkspaceService kendryteWorkspaceService: IKendryteWorkspaceService,
	) {
		super();
		this.currentProjectPath = kendryteWorkspaceService.requireCurrentWorkspace();
	}

	protected onData(line: string) {
		const m1 = regLdMissingReference.exec(line);
		if (m1) {
			this.diagnostic('error', 'LD: ' + m1[3], m1[1], m1[2], '0');
		}
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

		const line = parseInt(_line);
		const column = parseInt(_column);

		file = normalizePosixPath(file);
		if (!isAbsolute(file)) {
			file = resolvePath(this.currentProjectPath, file);
		}

		const list = this.errorMarkers.entry(file, () => {
			return [];
		});

		list.push({
			message,
			severity,
			startLineNumber: line,
			startColumn: column,
			endLineNumber: line,
			endColumn: column,
		});
	}

	public finalize() {
		for (const [file, markers] of this.errorMarkers.entries()) {
			this.markerService.changeOne(CMAKE_ERROR_MARKER, URI.file(file), markers);
		}
	}

	public dispose() {
		this.markerService.changeAll(CMAKE_ERROR_MARKER, []);
	}
}

export class CMakeBuildProgressProcessor extends CMakeProcessor {
	private bar: TextProgressBar;
	private readonly CMAKE_PROGRESS = 'cmake.progress';

	constructor(
		protected statusBarController: IKendryteStatusControllerService,
	) {
		super();
		this.bar = new TextProgressBar(20);
		this.bar.infinite();
	}

	protected onData(line: string) {
		const m1 = regCMakeProgress.exec(line);
		if (m1) {
			this.bar.percent(parseInt(m1[1]));
			this.statusBarController.showMessage(this.CMAKE_PROGRESS).text = this.bar.toString();
		}
		return !!m1;
	}

	finalize(): void {
		this.bar.dispose();
		delete this.bar;
		this.statusBarController.resolveMessage(this.CMAKE_PROGRESS);
	}

	dispose(): void {
		// nothing to do
	}
}