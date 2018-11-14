"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function wrapTable(...elements) {
    let ret = '<table class="table">';
    for (const body of elements) {
        ret += `<tbody>
	${body}
</tbody>
`;
    }
    return ret + '</table>';
}
exports.wrapTable = wrapTable;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcFRhYmxlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlcyI6WyJidWlsZC1lbnYvaW5kZXgtcmVuZGVyL2NvbXBvbmVudHMvd3JhcFRhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBZ0IsU0FBUyxDQUFDLEdBQUcsUUFBa0I7SUFDOUMsSUFBSSxHQUFHLEdBQUcsdUJBQXVCLENBQUM7SUFFbEMsS0FBSyxNQUFNLElBQUksSUFBSSxRQUFRLEVBQUU7UUFDNUIsR0FBRyxJQUFJO0dBQ04sSUFBSTs7Q0FFTixDQUFDO0tBQ0E7SUFDRCxPQUFPLEdBQUcsR0FBRyxVQUFVLENBQUM7QUFDekIsQ0FBQztBQVZELDhCQVVDIn0=