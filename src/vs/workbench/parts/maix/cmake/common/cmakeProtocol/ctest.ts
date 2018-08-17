export interface ICMakeTestInfo {
	name: string; // contains the name of the configuration. The name may be empty.
	projects: ICMakeTestProject[]; // contains a list of project objects, one for each build project.
}

export interface ICMakeTestProject {
	name: string; // contains the (sub-)projects name.
	ctestInfo: ICMakeTestObject[];// contains a list of test objects.
}

export interface ICMakeTestObject {
	ctestName: string; // contains the name of the test.
	ctestCommand: string; // contains the test command.
	properties: ICMakeTestProps[]; // contains a list of test property objects.
}

export interface ICMakeTestProps {
	key: string;
	value: string;
}