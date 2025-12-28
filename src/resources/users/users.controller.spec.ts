import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

import { UserEntity } from "./entities/user.entity";

import { MockedService } from "test/utils/mocked-service.type";

import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

describe("UsersController", () => {
	let controller: UsersController;
	let usersServiceMock: Pick<
		MockedService<UsersService>,
		"create" | "findAllBySchool" | "findOne" | "update" | "remove"
	>;

	beforeEach(async () => {
		usersServiceMock = {
			create: jest.fn().mockImplementation((dto: CreateUserDto) =>
				plainToInstance(UserEntity, {
					id: "1",
					...dto,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			findAllBySchool: jest.fn().mockImplementation((schoolId: string) =>
				[
					{
						id: "1",
						name: "User One",
						email: "userone@example.com",
						roleIds: ["role1"],
						schoolId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "2",
						name: "User Two",
						email: "usertwo@example.com",
						roleIds: ["role2"],
						schoolId,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				].map(user => plainToInstance(UserEntity, user))
			),
			findOne: jest.fn().mockImplementation((id: string) =>
				plainToInstance(UserEntity, {
					id,
					name: "Single User",
					email: "singleuser@example.com",
					roleIds: ["role1", "role2"],
					schoolId: "school-123",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
			update: jest
				.fn()
				.mockImplementation((id: string, dto: UpdateUserDto) =>
					plainToInstance(UserEntity, {
						id,
						...dto,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
				),
			remove: jest.fn().mockImplementation((id: string) =>
				plainToInstance(UserEntity, {
					id,
					name: "Deleted User",
					email: "deleteduser@example.com",
					roleIds: [],
					schoolId: "school-123",
					createdAt: new Date(),
					updatedAt: new Date(),
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [UsersService],
		})
			.overrideProvider(UsersService)
			.useValue(usersServiceMock)
			.compile();

		controller = module.get<UsersController>(UsersController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("create", () => {
		it("should create a user", async () => {
			const createUserDto: CreateUserDto = {
				name: "Test User",
				email: "testuser@example.com",
				password: "password123",
				roleIds: ["role1"],
				schoolId: "school-123",
			};

			const expected = new UserEntity({
				id: "1",
				...createUserDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.create(createUserDto)).toEqual({
				...expected,
				// password should not be returned
				password: undefined,
			});
			expect(usersServiceMock.create).toHaveBeenCalledWith(createUserDto);
		});
	});

	describe("findAllBySchool", () => {
		it("should return an array of users for a school", async () => {
			const schoolId = "school-123";

			const result = await controller.findAllBySchool(schoolId);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			result.forEach(item => expect(item).toBeInstanceOf(UserEntity));
			expect(usersServiceMock.findAllBySchool).toHaveBeenCalledWith(
				schoolId
			);
		});
	});

	describe("findOne", () => {
		it("should return a single user by ID", async () => {
			const id = "123";
			const expected = new UserEntity({
				id,
				name: "Single User",
				email: "singleuser@example.com",
				roleIds: ["role1", "role2"],
				schoolId: "school-123",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.findOne(id)).toEqual(expected);
			expect(usersServiceMock.findOne).toHaveBeenCalledWith(id);
		});

		it("should throw NotFoundException if user not found", async () => {
			const id = "nonexistent-id";
			usersServiceMock.findOne.mockImplementation(() => {
				throw new NotFoundException(`User with ID ${id} not found`);
			});

			await expect(controller.findOne(id)).rejects.toThrow(
				NotFoundException
			);
			expect(usersServiceMock.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe("update", () => {
		it("should update a user by ID", async () => {
			const id = "123";

			const updateUserDto: UpdateUserDto = {
				name: "Updated User",
				email: "updateduser@example.com",
				roleIds: ["role3"],
				schoolId: "school-456",
			};

			const expected = new UserEntity({
				id,
				...updateUserDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.update(id, updateUserDto)).toEqual(
				expected
			);
			expect(usersServiceMock.update).toHaveBeenCalledWith(
				id,
				updateUserDto
			);
		});
	});

	describe("remove", () => {
		it("should remove a user by ID", async () => {
			const id = "123";

			const expected = new UserEntity({
				id,
				name: "Deleted User",
				email: "deleteduser@example.com",
				roleIds: [],
				schoolId: "school-123",
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.remove(id)).toEqual(expected);
			expect(usersServiceMock.remove).toHaveBeenCalledWith(id);
		});
	});
});
