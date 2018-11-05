"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const include_1 = require("../build-env/include");
const output_1 = require("../build-env/output");
const packWindows_1 = require("../build-env/packWindows");
include_1.runMain(async () => {
    const output = output_1.usePretty();
    await packWindows_1.reset_asar(output);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlaW5zdGFsbC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsibnBtL3ByZWluc3RhbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBK0M7QUFDL0MsZ0RBQWdEO0FBQ2hELDBEQUFzRDtBQUV0RCxpQkFBTyxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztJQUMzQixNQUFNLHdCQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsQ0FBQyxDQUFDLENBQUMifQ==