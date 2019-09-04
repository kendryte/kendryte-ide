import { CancellationToken, CancellationTokenSource } from 'vs/base/common/cancellation';
import { DeferredPromise } from 'vs/kendryte/vs/base/common/deferredPromise';
import { setImmediate } from 'vs/base/common/platform';
import { IDisposable } from 'vs/base/common/lifecycle';
import { canceled, disposed } from 'vs/base/common/errors';

export interface SimpleWorkerThread<T, D> {
	(ctx: D, job: T, cancel: CancellationToken): Promise<void>;
}

export class SimpleWorkerPool<T, D = any> implements IDisposable {
	private busy = 0;
	private isRunning = false;
	private jobs: IterableIterator<T>;
	private cancel = new CancellationTokenSource();
	private deferred = new DeferredPromise<void>();
	private context: D;

	constructor(
		private readonly size: number,
		private readonly worker: SimpleWorkerThread<T, D>,
	) {
		this.cancel.token.onCancellationRequested(() => {
			this.deferred.error(canceled());
		});
	}

	public dispose(): void {
		if (!this.deferred.completed) {
			this.deferred.error(disposed('SimpleWorkerPool'));
		}
		if (this.isRunning) {
			this.cancel.cancel();
		}
		this.cancel.dispose();
	}

	run(shared: D, jobs: IterableIterator<T>, token: CancellationToken) {
		if (this.isRunning) {
			throw new Error('worker is running or completed.');
		}
		this.isRunning = true;
		this.jobs = jobs;
		this.context = shared;

		token.onCancellationRequested(() => {
			this.cancel.cancel();
		});

		for (let i = 0; i < this.size; i++) {
			this.busy++;
			setImmediate(() => {
				this.next();
			});
		}

		return this.deferred.p;
	}

	private next() {
		const job = this.jobs.next();
		if (job.done || this.cancel.token.isCancellationRequested) {
			this.busy--;
			if (this.busy === 0) {
				this.deferred.complete();
			}
			return;
		}

		const p = this.worker(this.context, job.value, this.cancel.token);

		p.catch((err) => {
			this.deferred.error(err);
			this.cancel.cancel();
		}).finally(() => {
			setImmediate(() => {
				this.next();
			});
		});
	}
}
