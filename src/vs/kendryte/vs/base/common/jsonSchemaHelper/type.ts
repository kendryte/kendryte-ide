import { IJSONSchema } from 'vs/base/common/jsonSchema';

export type IJSONSchemaMapOf<K> = Record<keyof K, IJSONSchema>
