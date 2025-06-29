export type MockedService<T> = {
	[K in keyof T]: T[K] extends (...args: infer A) => infer R
		? jest.Mock<Promise<Awaited<R>>, A> | jest.Mock<Awaited<R>, A>
		: never;
};
