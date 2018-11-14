"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const awsUtil_1 = require("../build-env/misc/awsUtil");
const globalOutput_1 = require("../build-env/misc/globalOutput");
const help_1 = require("../build-env/misc/help");
const myBuildSystem_1 = require("../build-env/misc/myBuildSystem");
const usePretty_1 = require("../build-env/misc/usePretty");
help_1.whatIsThis(__filename, 'try to login to s3 with your default credentials.');
const { compress } = require('targz');
myBuildSystem_1.runMain(async () => {
    try {
        const output = usePretty_1.usePretty();
        globalOutput_1.globalInterruptLog('HTTP_PROXY=%s', process.env.HTTP_PROXY);
        await awsUtil_1.initS3(output);
        await awsUtil_1.s3LoadText(awsUtil_1.OBJKEY_IDE_JSON);
        output.success('Done. Your config file all right.');
    }
    catch (e) {
        console.error(e.message);
        console.log('Failed to download test file from aws. your config is not valid.');
        process.exit(1);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ5LWF3cy5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiY29tbWFuZHMvdHJ5LWF3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFnRjtBQUNoRixpRUFBb0U7QUFDcEUsaURBQW9EO0FBQ3BELG1FQUEwRDtBQUMxRCwyREFBd0Q7QUFFeEQsaUJBQVUsQ0FBQyxVQUFVLEVBQUUsbURBQW1ELENBQUMsQ0FBQztBQUU1RSxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBRXBDLHVCQUFPLENBQUMsS0FBSyxJQUFJLEVBQUU7SUFDbEIsSUFBSTtRQUNILE1BQU0sTUFBTSxHQUFHLHFCQUFTLEVBQUUsQ0FBQztRQUMzQixpQ0FBa0IsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM1RCxNQUFNLGdCQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFckIsTUFBTSxvQkFBVSxDQUFDLHlCQUFlLENBQUMsQ0FBQztRQUVsQyxNQUFNLENBQUMsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7S0FDcEQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0VBQWtFLENBQUMsQ0FBQztRQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2hCO0FBQ0YsQ0FBQyxDQUFDLENBQUMifQ==