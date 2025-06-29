import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";

import { CreateClassDto } from "./dto/create-class.dto";
import { UpdateClassDto } from "./dto/update-class.dto";

import { ClassEntity } from "./entities/class.entity";

import { MockedService } from "test/utils/mocked-service.type";

import { ClassesController } from "./classes.controller";
import { ClassesService } from "./classes.service";

describe("ClassesController", () => {
	let controller: ClassesController;
	let classesServiceMock: Pick<
		MockedService<ClassesService>,
		"create" | "findAllBySchool" | "findOne" | "update" | "remove"
	>;

	beforeEach(async () => {
		classesServiceMock = {
			create: jest.fn().mockImplementation((dto: CreateClassDto) =>
				plainToInstance(ClassEntity, {
					id: "1",
					...dto,
				})
			),
			findAllBySchool: jest.fn().mockImplementation((schoolId: string) =>
				[
					{ id: "1", name: "Class 1", schoolId },
					{ id: "2", name: "Class 2", schoolId },
				].map(classData => plainToInstance(ClassEntity, classData))
			),
			findOne: jest.fn().mockImplementation((id: string) =>
				plainToInstance(ClassEntity, {
					id,
					name: "Single Class",
				})
			),
			update: jest
				.fn()
				.mockImplementation((id: string, dto: UpdateClassDto) =>
					plainToInstance(ClassEntity, {
						id,
						...dto,
					})
				),
			remove: jest.fn().mockImplementation((id: string) =>
				plainToInstance(ClassEntity, {
					id,
					name: "Deleted Class",
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [ClassesController],
			providers: [ClassesService],
		})
			.overrideProvider(ClassesService)
			.useValue(classesServiceMock)
			.compile();

		controller = module.get<ClassesController>(ClassesController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("create", () => {
		it("should create a new class", async () => {
			const createClassDto: CreateClassDto = {
				name: "Test Class",
				schoolId: "school123",
			};

			const expected = new ClassEntity({
				id: "1",
				...createClassDto,
			});

			expect(await controller.create(createClassDto)).toEqual(expected);
			expect(classesServiceMock.create).toHaveBeenCalledWith(
				createClassDto
			);
		});
	});

	describe("findAllBySchool", () => {
		it("should return all classes for a school", async () => {
			const schoolId = "school123";

			const result = await controller.findAllBySchool(schoolId);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			result.forEach(item => expect(item).toBeInstanceOf(ClassEntity));
			expect(classesServiceMock.findAllBySchool).toHaveBeenCalledWith(
				schoolId
			);
		});
	});

	describe("findOne", () => {
		it("should return a class by ID", async () => {
			const id = "1";

			const expected = new ClassEntity({
				id,
				name: "Single Class",
			});

			expect(await controller.findOne(id)).toEqual(expected);
			expect(classesServiceMock.findOne).toHaveBeenCalledWith(id);
		});

		it("should throw NotFoundException if class not found", async () => {
			const id = "nonexistent-id";

			classesServiceMock.findOne.mockImplementation(() => {
				throw new NotFoundException(`Class with ID ${id} not found`);
			});

			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException
			);
			expect(classesServiceMock.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe("update", () => {
		it("should update a class by ID", async () => {
			const id = "1";

			const updateClassDto: UpdateClassDto = { name: "Updated Class" };

			const expected = new ClassEntity({
				id,
				...updateClassDto,
			});

			expect(await controller.update(id, updateClassDto)).toEqual(
				expected
			);
			expect(classesServiceMock.update).toHaveBeenCalledWith(
				id,
				updateClassDto
			);
		});
	});

	describe("remove", () => {
		it("should delete a class by ID", async () => {
			const id = "1";

			const expected = new ClassEntity({
				id,
				name: "Deleted Class",
			});

			expect(await controller.remove(id)).toEqual(expected);
			expect(classesServiceMock.remove).toHaveBeenCalledWith(id);
		});
	});
});
