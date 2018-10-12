export interface IRemoteProgress {
	id: string;
	title: string;
	message: string;
	current: number;
	total: number;
	infinite: boolean;
}
