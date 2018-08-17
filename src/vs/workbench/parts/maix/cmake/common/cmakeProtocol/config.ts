export enum CMAKE_TARGET_TYPE {
	STATIC_LIBRARY = 'STATIC_LIBRARY',
	MODULE_LIBRARY = 'MODULE_LIBRARY',
	SHARED_LIBRARY = 'SHARED_LIBRARY',
	OBJECT_LIBRARY = 'OBJECT_LIBRARY',
	EXECUTABLE = 'EXECUTABLE',
	UTILITY = 'UTILITY',
	INTERFACE_LIBRARY = 'INTERFACE_LIBRARY',
}

export interface ICMakeConfigurationFileGroup {
	language: string; // contains the programming language used by all files in the group.
	compileFlags: string; // with a string containing all the flags passed to the compiler when building any of the files in this group. This value is encoded in the system’s native shell format.
	includePath: string[]; // with a list of include paths. Each include path is an object containing a “path” with the actual include path and “isSystem” with a bool value informing whether this is a normal include or a system include. This value is encoded in the system’s native shell format.
	defines: string[]; // with a list of defines in the form “SOMEVALUE” or “SOMEVALUE=42”. This value is encoded in the system’s native shell format.
	sources: string[]; // with a list of source files.
	isGenerated: boolean;
}

export interface ICMakeConfigurationTarget {
	name: string; // contains the name of the target.
	type: CMAKE_TARGET_TYPE; // defines the type of build of the target.
	fullName: string; // contains the full name of the build result (incl. extensions, etc.).
	sourceDirectory: string; // contains the current source directory.
	buildDirectory: string; // contains the current build directory.
	artifacts: string[]; // with a list of build artifacts. The list is sorted with the most important artifacts first (e.g. a .DLL file is listed before a .PDB file on windows).
	linkerLanguage: string; // contains the language of the linker used to produce the artifact.
	linkLibraries: string; // with a list of libraries to link to. This value is encoded in the system’s native shell format.
	linkFlags: string; // with a list of flags to pass to the linker. This value is encoded in the system’s native shell format.
	linkLanguageFlags: string; // with the flags for a compiler using the linkerLanguage. This value is encoded in the system’s native shell format.
	frameworkPath: string; // with the framework path (on Apple computers). This value is encoded in the system’s native shell format.
	linkPath: string; // with the link path. This value is encoded in the system’s native shell format.
	sysroot: string; // with the sysroot path.
	fileGroups: ICMakeConfigurationFileGroup[]; // contains the source files making up the target.
}

export interface ICMakeConfigurationProject {
	name: string; // contains the (sub-)projects name.
	sourceDirectory: string; // contains the current source directory
	buildDirectory: string; // contains the current build directory.
	targets: ICMakeConfigurationTarget[]; // contains a list of build system target objects.
}

export interface ICMakeCodeModel {
	name: string;
	projects: ICMakeConfigurationProject[];
}