import { IIdentityProvider } from 'vs/base/browser/ui/list/list';

export function SimpleIdProvider<T extends { id: string }>(): IIdentityProvider<T> {
	return { getId: (e: T) => e.id };
}
