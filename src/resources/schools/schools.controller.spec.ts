import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";

import { CreateSchoolDto } from "./dto/create-school.dto";
import { UpdateSchoolDto } from "./dto/update-school.dto";

import { SchoolEntity } from "./entities/school.entity";

import { MockedService } from "test/utils/mocked-service.type";

import { SchoolsController } from "./schools.controller";
import { SchoolsService } from "./schools.service";

describe("SchoolsController", () => {
	let controller: SchoolsController;
	let schoolsServiceMock: Pick<
		MockedService<SchoolsService>,
		"create" | "findAll" | "findOne" | "update" | "remove"
	>;

	beforeEach(async () => {
		schoolsServiceMock = {
			create: jest.fn().mockImplementation((dto: CreateSchoolDto) =>
				plainToInstance(SchoolEntity, {
					id: "1",
					...dto,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			findAll: jest.fn().mockImplementation(() =>
				[
					{
						id: "1",
						name: "School One",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "2",
						name: "School Two",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				].map(school => plainToInstance(SchoolEntity, school))
			),
			findOne: jest.fn().mockImplementation((id: string) =>
				plainToInstance(SchoolEntity, {
					id,
					name: "Single School",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			update: jest
				.fn()
				.mockImplementation((id: string, dto: UpdateSchoolDto) =>
					plainToInstance(SchoolEntity, {
						id,
						...dto,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
				),
			remove: jest.fn().mockImplementation((id: string) =>
				plainToInstance(SchoolEntity, {
					id,
					name: "Deleted School",
					createdAt: new Date(),
					updatedAt: new Date(),
					deleted: true,
					deletedAt: new Date(),
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [SchoolsController],
			providers: [SchoolsService],
		})
			.overrideProvider(SchoolsService)
			.useValue(schoolsServiceMock)
			.compile();

		controller = module.get<SchoolsController>(SchoolsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("create", () => {
		it("should create a school", async () => {
			const createSchoolDto: CreateSchoolDto = { name: "Test School" };

			const expected = new SchoolEntity({
				id: "1",
				...createSchoolDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deleted: false,
				deletedAt: null,
			});

			expect(await controller.create(createSchoolDto)).toEqual(expected);
			expect(schoolsServiceMock.create).toHaveBeenCalledWith(
				createSchoolDto
			);
		});
	});

	describe("findAll", () => {
		it("should return an array of schools", async () => {
			const result = await controller.findAll();

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			result.forEach(item => expect(item).toBeInstanceOf(SchoolEntity));
			expect(schoolsServiceMock.findAll).toHaveBeenCalled();
		});
	});

	describe("findOne", () => {
		it("should return a single school by ID", async () => {
			const id = "123";

			const expected = new SchoolEntity({
				id,
				name: "Single School",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deleted: false,
				deletedAt: null,
			});

			expect(await controller.findOne(id)).toEqual(expected);
			expect(schoolsServiceMock.findOne).toHaveBeenCalledWith(id);
		});

		it("should throw NotFoundException if school not found", async () => {
			const id = "nonexistent-id";

			schoolsServiceMock.findOne.mockImplementation(() => {
				throw new NotFoundException(`School with ID ${id} not found`);
			});

			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException
			);
			expect(schoolsServiceMock.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe("update", () => {
		it("should update a school by ID", async () => {
			const id = "123";

			const updateSchoolDto: UpdateSchoolDto = { name: "Updated School" };

			const expected = new SchoolEntity({
				id,
				...updateSchoolDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deleted: false,
				deletedAt: null,
			});

			expect(await controller.update(id, updateSchoolDto)).toEqual(
				expected
			);
			expect(schoolsServiceMock.update).toHaveBeenCalledWith(
				id,
				updateSchoolDto
			);
		});
	});

	describe("remove", () => {
		it("should remove (soft delete) a school by ID", async () => {
			const id = "123";

			const expected = new SchoolEntity({
				id,
				name: "Deleted School",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deleted: true,
				deletedAt: expect.any(Date),
			});

			expect(await controller.remove(id)).toEqual(expected);
			expect(schoolsServiceMock.remove).toHaveBeenCalledWith(id);
		});
	});
});
