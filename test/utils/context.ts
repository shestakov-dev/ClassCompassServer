import { DeepMockProxy, mockDeep } from "jest-mock-extended";

import { PrismaClientExtended } from "@prisma/custom-prisma-client";

export type Context = {
	prisma: PrismaClientExtended;
};

export type MockContext = {
	prisma: DeepMockProxy<PrismaClientExtended>;
};

export const createMockContext = (): MockContext => {
	return {
		prisma: mockDeep<PrismaClientExtended>(),
	};
};
