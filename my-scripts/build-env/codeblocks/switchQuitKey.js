"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function switchQuitKey() {
    process.on('SIGINT', () => {
        process.stderr.write('\r\x1BKPress Ctrl+K to quit.\n');
    });
    console.log('\n\x1B[38;5;14m!!! Press Ctrl+K instead of Ctrl+C to stop this. !!!\x1B[0m');
    process.stdin.on('data', (data) => {
        if (data.length === 1 && data[0] === 0x0B) {
            process.exit(0);
        }
    });
}
exports.switchQuitKey = switchQuitKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3dpdGNoUXVpdEtleS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2NvZGVibG9ja3Mvc3dpdGNoUXVpdEtleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLFNBQWdCLGFBQWE7SUFDNUIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLDRFQUE0RSxDQUFDLENBQUM7SUFFMUYsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBWSxFQUFFLEVBQUU7UUFDekMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7SUFDRixDQUFDLENBQUMsQ0FBQztBQUNKLENBQUM7QUFaRCxzQ0FZQyJ9