"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const constants_1 = require("../misc/constants");
const pathSp = constants_1.isWin ? ';' : ':';
function mergeEnv() {
    const cwd = process.cwd();
    const newEnv = {
        PATH: path_1.resolve(cwd, 'node_modules/.bin'),
    };
    Object.keys(process.env).forEach((k) => {
        if (k.toLowerCase() === 'path') {
            newEnv.PATH += pathSp + process.env[k];
        }
        else {
            newEnv[k] = process.env[k];
        }
    });
    return {
        cwd,
        env: newEnv,
    };
}
exports.mergeEnv = mergeEnv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY2hpbGRwcm9jZXNzL2Vudi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQixpREFBMEM7QUFFMUMsTUFBTSxNQUFNLEdBQUcsaUJBQUssQ0FBQSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFFaEMsU0FBZ0IsUUFBUTtJQUN2QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUIsTUFBTSxNQUFNLEdBQXNCO1FBQ2pDLElBQUksRUFBRSxjQUFPLENBQUMsR0FBRyxFQUFFLG1CQUFtQixDQUFDO0tBQ3ZDLENBQUM7SUFDRixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxNQUFNLEVBQUU7WUFDL0IsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QzthQUFNO1lBQ04sTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0I7SUFDRixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU87UUFDTixHQUFHO1FBQ0gsR0FBRyxFQUFFLE1BQU07S0FDWCxDQUFDO0FBQ0gsQ0FBQztBQWhCRCw0QkFnQkMifQ==