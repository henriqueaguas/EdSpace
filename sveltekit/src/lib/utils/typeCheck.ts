export const typeCheck = <Type>(obj: Type) => obj as any;

export type AreAllTrue<A> = A extends []
	? true
	: A extends [infer L, ...infer R]
	? L extends true
		? AreAllTrue<R>
		: false
	: boolean;
