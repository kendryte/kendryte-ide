export interface CMakeSettingsGenerators {
	extraGenerators?: string[];
	name: string;
	platformSupport: boolean;
	toolsetSupport: boolean;
}

export interface CMakeSettingsVersion {
	isDirty: boolean;
	major: number;
	minor: number;
	patch: number;
	string: string;
	suffix: string;
}

export interface ICMakeSettings {
	sourceDirectory?: string; // with a path to the sources
	buildDirectory: string; // with a path to the build directory
	generator?: string; // with the generator name
	extraGenerator?: string; // (optional!) with the extra generator to be used
	platform?: string; // with the generator platform (if supported by the generator)
	toolset?: string; // with the generator toolset (if supported by the generator)
	capabilities: {
		generators: CMakeSettingsGenerators[];
		serverMode: boolean;
		version: CMakeSettingsVersion
	};
	checkSystemVars: boolean;
	debugOutput: boolean;
	trace: boolean;
	traceExpand: boolean;
	warnUninitialized: boolean;
	warnUnused: boolean;
	warnUnusedCli: boolean;
}
