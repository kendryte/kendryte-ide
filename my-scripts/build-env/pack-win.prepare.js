"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const include_1 = require("./include");
const root = path_1.resolve(__dirname, '../..');
console.log('  sourceRoot = ', root);
console.log('  packageRoot = ', include_1.yarnPackageDir('.'));
const yarnRc = `disturl "https://atom.io/download/electron"
target "2.0.7"
runtime "electron"
cache-folder ${JSON.stringify(process.env.YARN_CACHE_FOLDER)}
`;
const originalPkg = require(path_1.resolve(root, 'package.json'));
const originalLock = fs_1.readFileSync(path_1.resolve(root, 'yarn.lock'));
//// dependencies
console.log('  create dependencies');
include_1.cdNewDir(include_1.yarnPackageDir('dependencies'));
fs_1.writeFileSync('package.json', JSON.stringify({
    dependencies: {
        ...originalPkg.dependencies,
    },
}));
fs_1.writeFileSync('.yarnrc', yarnRc);
fs_1.writeFileSync('yarn.lock', originalLock);
const bothDependencies = ['applicationinsights', 'source-map-support'];
bothDependencies.forEach((item) => {
    originalPkg.devDependencies[item] = originalPkg.dependencies[item];
});
//// devDependencies
console.log('  create devDependencies');
include_1.cdNewDir(include_1.yarnPackageDir('devDependencies'));
fs_1.writeFileSync('package.json', JSON.stringify({
    dependencies: {
        ...originalPkg.devDependencies,
        'lnk-cli': 'latest',
    },
}));
fs_1.writeFileSync('yarn.lock', originalLock);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFjay13aW4ucHJlcGFyZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBhY2std2luLnByZXBhcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwrQkFBK0I7QUFDL0IsMkJBQTREO0FBRTVELHVDQUFxRDtBQUVyRCxNQUFNLElBQUksR0FBRyxjQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSx3QkFBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFckQsTUFBTSxNQUFNLEdBQUc7OztlQUdBLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztDQUMzRCxDQUFDO0FBRUYsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLGNBQU8sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUMzRCxNQUFNLFlBQVksR0FBRyxpQkFBWSxDQUFDLGNBQU8sQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUU5RCxpQkFBaUI7QUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBQ3JDLGtCQUFRLENBQUMsd0JBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGtCQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDNUMsWUFBWSxFQUFFO1FBQ2IsR0FBRyxXQUFXLENBQUMsWUFBWTtLQUMzQjtDQUNELENBQUMsQ0FBQyxDQUFDO0FBQ0osa0JBQWEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakMsa0JBQWEsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFFekMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLHFCQUFxQixFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDdkUsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7SUFDakMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BFLENBQUMsQ0FBQyxDQUFDO0FBRUgsb0JBQW9CO0FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUN4QyxrQkFBUSxDQUFDLHdCQUFjLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQzVDLGtCQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDNUMsWUFBWSxFQUFFO1FBQ2IsR0FBRyxXQUFXLENBQUMsZUFBZTtRQUM5QixTQUFTLEVBQUUsUUFBUTtLQUNuQjtDQUNELENBQUMsQ0FBQyxDQUFDO0FBQ0osa0JBQWEsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUMifQ==