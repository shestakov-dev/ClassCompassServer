import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";

import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";

import { StudentEntity } from "./entities/student.entity";

import { MockedService } from "test/utils/mocked-service.type";

import { StudentsController } from "./students.controller";
import { StudentsService } from "./students.service";

describe("StudentsController", () => {
	let controller: StudentsController;
	let studentsServiceMock: Pick<
		MockedService<StudentsService>,
		"create" | "findAllByClass" | "findOne" | "update" | "remove"
	>;

	beforeEach(async () => {
		studentsServiceMock = {
			create: jest.fn().mockImplementation((dto: CreateStudentDto) =>
				plainToInstance(StudentEntity, {
					id: "1",
					...dto,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			findAllByClass: jest.fn().mockImplementation((classId: string) =>
				[
					{
						id: "1",
						userId: "user1",
						classId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "2",
						userId: "user2",
						classId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				].map(student => plainToInstance(StudentEntity, student))
			),
			findOne: jest.fn().mockImplementation((id: string) =>
				plainToInstance(StudentEntity, {
					id,
					userId: "user123",
					classId: "class123",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			update: jest
				.fn()
				.mockImplementation((id: string, dto: UpdateStudentDto) =>
					plainToInstance(StudentEntity, {
						id,
						...dto,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
				),
			remove: jest.fn().mockImplementation((id: string) =>
				plainToInstance(StudentEntity, {
					id,
					userId: "user123",
					classId: "class123",
					createdAt: new Date(),
					updatedAt: new Date(),
					deleted: true,
					deletedAt: new Date(),
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [StudentsController],
			providers: [StudentsService],
		})
			.overrideProvider(StudentsService)
			.useValue(studentsServiceMock)
			.compile();

		controller = module.get<StudentsController>(StudentsController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("create", () => {
		it("should create a new student", async () => {
			const createStudentDto: CreateStudentDto = {
				userId: "user123",
				classId: "class123",
			};

			const expected = new StudentEntity({
				id: "1",
				...createStudentDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.create(createStudentDto)).toEqual(expected);
			expect(studentsServiceMock.create).toHaveBeenCalledWith(
				createStudentDto
			);
		});
	});

	describe("findAll", () => {
		it("should return all students for a class", async () => {
			const classId = "class123";

			const result = await controller.findAllByClass(classId);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			result.forEach(item => expect(item).toBeInstanceOf(StudentEntity));
			expect(studentsServiceMock.findAllByClass).toHaveBeenCalledWith(
				classId
			);
		});
	});

	describe("findOne", () => {
		it("should return a student by ID", async () => {
			const id = "1";

			const expected = new StudentEntity({
				id,
				userId: "user123",
				classId: "class123",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.findOne(id)).toEqual(expected);
			expect(studentsServiceMock.findOne).toHaveBeenCalledWith(id);
		});

		it("should throw NotFoundException if student not found", async () => {
			const id = "nonexistent-id";

			studentsServiceMock.findOne.mockImplementation(() => {
				throw new NotFoundException(`Student with ID ${id} not found`);
			});

			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException
			);
			expect(studentsServiceMock.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe("update", () => {
		it("should update a student by ID", async () => {
			const id = "1";

			const updateStudentDto: UpdateStudentDto = {
				userId: "updated-user123",
				classId: "updated-class123",
			};

			const expected = new StudentEntity({
				id,
				...updateStudentDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.update(id, updateStudentDto)).toEqual(
				expected
			);
			expect(studentsServiceMock.update).toHaveBeenCalledWith(
				id,
				updateStudentDto
			);
		});
	});

	describe("remove", () => {
		it("should delete a student by ID", async () => {
			const id = "1";

			const expected = new StudentEntity({
				id,
				userId: "user123",
				classId: "class123",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deleted: true,
				deletedAt: expect.any(Date),
			});

			expect(await controller.remove(id)).toEqual(expected);
			expect(studentsServiceMock.remove).toHaveBeenCalledWith(id);
		});
	});
});
