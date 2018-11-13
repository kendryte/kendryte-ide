"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const constants_1 = require("../misc/constants");
const pathSp = constants_1.isWin ? ';' : ':';
function mergeEnv() {
    const cwd = process.cwd();
    const newEnv = {
        PATH: '',
    };
    Object.keys(process.env).forEach((k) => {
        if (k.toLowerCase() === 'path') {
            newEnv.PATH += process.env[k] + pathSp;
        }
        else {
            newEnv[k] = process.env[k];
        }
    });
    newEnv.PATH += path_1.resolve(cwd, 'node_modules/.bin');
    return {
        cwd,
        env: newEnv,
    };
}
exports.mergeEnv = mergeEnv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvY2hpbGRwcm9jZXNzL2Vudi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUErQjtBQUMvQixpREFBMEM7QUFFMUMsTUFBTSxNQUFNLEdBQUcsaUJBQUssQ0FBQSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFFaEMsU0FBZ0IsUUFBUTtJQUN2QixNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUIsTUFBTSxNQUFNLEdBQXNCO1FBQ2pDLElBQUksRUFBRSxFQUFFO0tBQ1IsQ0FBQztJQUNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ3RDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sRUFBRTtZQUMvQixNQUFNLENBQUMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQ3ZDO2FBQU07WUFDTixNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQjtJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxDQUFDLElBQUksSUFBSSxjQUFPLENBQUMsR0FBRyxFQUFFLG1CQUFtQixDQUFDLENBQUM7SUFFakQsT0FBTztRQUNOLEdBQUc7UUFDSCxHQUFHLEVBQUUsTUFBTTtLQUNYLENBQUM7QUFDSCxDQUFDO0FBbkJELDRCQW1CQyJ9