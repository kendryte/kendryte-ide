// The state is an object that looks like this:
declare interface ProgressReport {
	percent: number;               // Overall percent (between 0 to 1)
	speed: number;                 // The download speed in bytes/sec
	size: {
		total: number;             // The total payload size in bytes
		transferred: number;       // The transferred payload size in bytes
	};
	time: {
		elapsed: number;            // The total elapsed seconds since the start (3 decimals)
		remaining: number;          // The remaining seconds to finish (3 decimals)
	};
}