"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stillalive_1 = require("@gongt/stillalive");
const globalOutput_1 = require("./globalOutput");
const myBuildSystem_1 = require("./myBuildSystem");
function usePretty(opts) {
    const stream = stillalive_1.startWorking();
    globalOutput_1.useThisStream(stream);
    Object.assign(stream, { noEnd: true });
    myBuildSystem_1.mainDispose((error) => {
        globalOutput_1.useThisStream(process.stderr);
        if (error) {
            stream.fail(error.message);
        }
        stream.end();
    });
    return stream;
}
exports.usePretty = usePretty;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlUHJldHR5LmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvbWlzYy91c2VQcmV0dHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBaUY7QUFDakYsaURBQStDO0FBQy9DLG1EQUE4QztBQUU5QyxTQUFnQixTQUFTLENBQUMsSUFBZ0I7SUFDekMsTUFBTSxNQUFNLEdBQUcseUJBQVksRUFBRSxDQUFDO0lBQzlCLDRCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNyQywyQkFBVyxDQUFDLENBQUMsS0FBWSxFQUFFLEVBQUU7UUFDNUIsNEJBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsSUFBSSxLQUFLLEVBQUU7WUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzQjtRQUNELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBWkQsOEJBWUMifQ==