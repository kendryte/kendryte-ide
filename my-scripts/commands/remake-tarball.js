"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zip_1 = require("../build-env/codeblocks/zip");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'Re-create zip files from current compiled result.');
myBuildSystem_1.runMain(async () => {
    const output = usePretty_1.usePretty('zip');
    await zip_1.creatingReleaseZip(output);
    output.success('Done.');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtYWtlLXRhcmJhbGwuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImNvbW1hbmRzL3JlbWFrZS10YXJiYWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQWlFO0FBQ2pFLGlEQUFvRDtBQUNwRCxtRUFBMEQ7QUFDMUQsMkRBQXdEO0FBRXhELGlCQUFVLENBQUMsVUFBVSxFQUFFLG1EQUFtRCxDQUFDLENBQUM7QUFFNUUsdUJBQU8sQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNsQixNQUFNLE1BQU0sR0FBRyxxQkFBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hDLE1BQU0sd0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUMsQ0FBQyJ9