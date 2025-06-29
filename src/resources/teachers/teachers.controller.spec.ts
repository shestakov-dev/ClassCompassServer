import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";

import { CreateTeacherDto } from "./dto/create-teacher.dto";
import { UpdateTeacherDto } from "./dto/update-teacher.dto";

import { TeacherEntity } from "./entities/teacher.entity";

import { MockedService } from "test/utils/mocked-service.type";

import { TeachersController } from "./teachers.controller";
import { TeachersService } from "./teachers.service";

describe("TeachersController", () => {
	let controller: TeachersController;
	let teachersServiceMock: Pick<
		MockedService<TeachersService>,
		"create" | "findOne" | "update" | "remove"
	>;

	beforeEach(async () => {
		teachersServiceMock = {
			create: jest.fn().mockImplementation((dto: CreateTeacherDto) =>
				plainToInstance(TeacherEntity, {
					id: "1",
					...dto,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			findOne: jest.fn().mockImplementation((id: string) =>
				plainToInstance(TeacherEntity, {
					id,
					userId: "user123",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			update: jest
				.fn()
				.mockImplementation((id: string, dto: UpdateTeacherDto) =>
					plainToInstance(TeacherEntity, {
						id,
						...dto,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
				),
			remove: jest.fn().mockImplementation((id: string) =>
				plainToInstance(TeacherEntity, {
					id,
					userId: "user123",
					createdAt: new Date(),
					updatedAt: new Date(),
					deleted: true,
					deletedAt: new Date(),
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TeachersController],
			providers: [TeachersService],
		})
			.overrideProvider(TeachersService)
			.useValue(teachersServiceMock)
			.compile();

		controller = module.get<TeachersController>(TeachersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("create", () => {
		it("should create a new teacher", async () => {
			const createTeacherDto: CreateTeacherDto = {
				userId: "user123",
			};

			const expected = new TeacherEntity({
				id: "1",
				...createTeacherDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.create(createTeacherDto)).toEqual(expected);
			expect(teachersServiceMock.create).toHaveBeenCalledWith(
				createTeacherDto
			);
		});
	});

	describe("findOne", () => {
		it("should return a teacher by ID", async () => {
			const id = "1";

			const expected = new TeacherEntity({
				id,
				userId: "user123",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.findOne(id)).toEqual(expected);
			expect(teachersServiceMock.findOne).toHaveBeenCalledWith(id);
		});

		it("should throw NotFoundException if teacher not found", async () => {
			const id = "nonexistent-id";

			teachersServiceMock.findOne.mockImplementation(() => {
				throw new NotFoundException(`Teacher with ID ${id} not found`);
			});

			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException
			);
			expect(teachersServiceMock.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe("update", () => {
		it("should update a teacher by ID", async () => {
			const id = "1";

			const updateTeacherDto: UpdateTeacherDto = {
				userId: "updated-user123",
			};

			const expected = new TeacherEntity({
				id,
				...updateTeacherDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.update(id, updateTeacherDto)).toEqual(
				expected
			);
			expect(teachersServiceMock.update).toHaveBeenCalledWith(
				id,
				updateTeacherDto
			);
		});
	});

	describe("remove", () => {
		it("should delete a teacher by ID", async () => {
			const id = "1";

			const expected = new TeacherEntity({
				id,
				userId: "user123",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deleted: true,
				deletedAt: expect.any(Date),
			});

			expect(await controller.remove(id)).toEqual(expected);
			expect(teachersServiceMock.remove).toHaveBeenCalledWith(id);
		});
	});
});
