"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
if (process.env.BUILDING) {
    console.error(' > preinstall: is BUILDING, skip.');
    process.exit(0);
}
const resetAsar_1 = require("../build-env/codeblocks/resetAsar");
const globalOutput_1 = require("../build-env/misc/globalOutput");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
myBuildSystem_1.runMain(async () => {
    const output = globalOutput_1.usePretty();
    await resetAsar_1.reset_asar(output);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsibnBtL3ByZWluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO0lBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ2hCO0FBRUQsaUVBQStEO0FBQy9ELGlFQUEyRDtBQUMzRCxtRUFBMEQ7QUFFMUQsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sR0FBRyx3QkFBUyxFQUFFLENBQUM7SUFDM0IsTUFBTSxzQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzFCLENBQUMsQ0FBQyxDQUFDIn0=