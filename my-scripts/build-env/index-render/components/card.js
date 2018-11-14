"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createCard(platform, version, table) {
    return `<div id="col${platform}" class="col-sm platform">
	<div class="card">
		<div class="card-header">
			<h5 class="card-title">${platform}</h5>
			<h6 class="card-subtitle mb-2 text-muted show-active">${version}</h6>
		</div>
		<div class="card-body">
			${table}
		</div>
	</div>
</div>`;
}
exports.createCard = createCard;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXMiOlsiYnVpbGQtZW52L2luZGV4LXJlbmRlci9jb21wb25lbnRzL2NhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxTQUFnQixVQUFVLENBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsS0FBYTtJQUMxRSxPQUFPLGVBQWUsUUFBUTs7OzRCQUdILFFBQVE7MkRBQ3VCLE9BQU87OztLQUc3RCxLQUFLOzs7T0FHSCxDQUFDO0FBQ1IsQ0FBQztBQVpELGdDQVlDIn0=