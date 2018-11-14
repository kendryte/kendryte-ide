"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const httpUtil_1 = require("../../misc/httpUtil");
const streamUtil_1 = require("../../misc/streamUtil");
async function buildHead(pieces) {
    const bs = await httpUtil_1.getWithCache('https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');
    pieces.push('<head>', '\t<meta charset="utf-8"/>', '\t<title>Kendryte IDE Downloads</title>', `\t<style type="text/css">${bs}</style>`, '\t<style type="text/css">');
    const { renderSync } = require('sass');
    const result = renderSync({
        file: path_1.resolve(__dirname, 'style.scss'),
        sourceMap: false,
        indentType: 'tab',
    });
    pieces.push(result.css.toString('utf8'), '</style>');
    pieces.push('</head>');
}
exports.buildHead = buildHead;
function download(url) {
    return new Promise((resolve, reject) => {
        httpUtil_1.request(url, { method: 'HEAD' }, (res) => {
            const body = res.pipe(new streamUtil_1.CollectingStream());
            body.promise().then(resolve, reject);
        }).end();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2luZGV4LXJlbmRlci9jb21wb25lbnRzL2hlYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSwrQkFBK0I7QUFDL0Isa0RBQTREO0FBQzVELHNEQUF5RDtBQUVsRCxLQUFLLFVBQVUsU0FBUyxDQUFDLE1BQWdCO0lBQy9DLE1BQU0sRUFBRSxHQUFHLE1BQU0sdUJBQVksQ0FBQywwRUFBMEUsQ0FBQyxDQUFDO0lBRTFHLE1BQU0sQ0FBQyxJQUFJLENBQ1YsUUFBUSxFQUNSLDJCQUEyQixFQUMzQix5Q0FBeUMsRUFDekMsNEJBQTRCLEVBQUUsVUFBVSxFQUN4QywyQkFBMkIsQ0FDM0IsQ0FBQztJQUVGLE1BQU0sRUFBQyxVQUFVLEVBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFckMsTUFBTSxNQUFNLEdBQUcsVUFBVSxDQUFDO1FBQ3pCLElBQUksRUFBRSxjQUFPLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztRQUN0QyxTQUFTLEVBQUUsS0FBSztRQUNoQixVQUFVLEVBQUUsS0FBSztLQUNqQixDQUFDLENBQUM7SUFFSCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDeEIsQ0FBQztBQXJCRCw4QkFxQkM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxHQUFXO0lBQzVCLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDdEMsa0JBQU8sQ0FBQyxHQUFHLEVBQUUsRUFBQyxNQUFNLEVBQUUsTUFBTSxFQUFDLEVBQUUsQ0FBQyxHQUFvQixFQUFFLEVBQUU7WUFDdkQsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLDZCQUFnQixFQUFFLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNWLENBQUMsQ0FBQyxDQUFDO0FBQ0osQ0FBQyJ9