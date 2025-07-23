import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "@prisma/prisma.service";

import { CreateSchoolDto } from "./dto/create-school.dto";

import { SchoolEntity } from "./entities/school.entity";

import { createMockContext, MockContext } from "@test/utils/context";

import { SchoolsService } from "./schools.service";

describe("SchoolsService", () => {
	let service: SchoolsService;
	let mockCtx: MockContext;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				SchoolsService,
				{
					provide: PrismaService,
					useValue: mockCtx,
				},
			],
		}).compile();

		service = module.get<SchoolsService>(SchoolsService);

		mockCtx = createMockContext();
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("create", () => {
		it("should create a school", async () => {
			const createSchoolDto: CreateSchoolDto = { name: "Test School" };
			mockCtx.prisma.client.school.create.mockResolvedValue({
				...new SchoolEntity(createSchoolDto),
				id: "1",
			});

			const expected = new SchoolEntity({
				...createSchoolDto,
				id: "1",
			});

			expect(await service.create(createSchoolDto)).toEqual(expected);
			expect(mockCtx.prisma.school.create).toHaveBeenCalledWith({
				data: createSchoolDto,
			});
		});
	});
});
