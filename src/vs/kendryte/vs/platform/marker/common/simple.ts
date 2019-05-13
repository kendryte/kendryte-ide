import { IMarkerData, MarkerSeverity } from 'vs/platform/markers/common/markers';
import { toErrorMessage } from 'vs/base/common/errorMessage';
import { ExParseError } from 'vs/kendryte/vs/base/common/jsonComments';

export function createSimpleMarker(severity: MarkerSeverity, message: string, line = 0): IMarkerData {
	return {
		severity,
		message,
		startLineNumber: line,
		startColumn: 0,
		endLineNumber: line,
		endColumn: 0,
	};
}

export function createSimpleErrorMarker(e: Error | string, line = 0): IMarkerData {
	return {
		severity: MarkerSeverity.Error,
		message: toErrorMessage(e),
		startLineNumber: line,
		startColumn: 0,
		endLineNumber: line,
		endColumn: 0,
	};
}

export function createSimpleJsonWarningMarkers(warnings: ExParseError[]): IMarkerData[] {
	return warnings.map((warn) => {
		return {
			severity: MarkerSeverity.Warning,
			message: warn.message,
			startLineNumber: warn.line,
			startColumn: 0,
			endLineNumber: warn.line,
			endColumn: 0,
		};
	});
}
