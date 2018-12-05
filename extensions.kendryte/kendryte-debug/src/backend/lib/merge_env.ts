export function merge_env(procEnv: any) {
	const env = {
		...process.env,
	};

	// Overwrite with user specified variables
	for (const key in procEnv) {
		if (procEnv.hasOwnProperty(key)) {
			if (procEnv[key] === null) {
				delete env[key];
			} else {
				env[key] = procEnv[key];
			}
		}
	}

	return env;
}