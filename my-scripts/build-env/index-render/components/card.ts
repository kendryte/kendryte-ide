export function createCard(platform: string, version: string, table: string) {
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