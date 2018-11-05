"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function switchQuitKey() {
    process.stdin.setRawMode(true);
    process.stdin.on('data', (data) => {
        if (data.length === 1 && data[0] === 0x0B) {
            process.stdin.setRawMode(false);
            process.exit(0);
        }
        if (data.length === 1 && data[0] === 0x03) {
            process.stderr.write('\r\n\x1B[38;5;14mPress Ctrl+K to quit.\x1B[0m\n\n');
        }
    });
    console.log('\n\x1B[38;5;14m!!! Press Ctrl+K instead of Ctrl+C to stop this. !!!\x1B[0m');
}
exports.switchQuitKey = switchQuitKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoUXVpdEtleS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3Mvc3dpdGNoUXVpdEtleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFNBQWdCLGFBQWE7SUFDNUIsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7UUFDekMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDMUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbURBQW1ELENBQUMsQ0FBQztTQUMxRTtJQUNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO0FBQzNGLENBQUM7QUFiRCxzQ0FhQyJ9