import { Test, TestingModule } from "@nestjs/testing";
import { plainToInstance } from "class-transformer";

import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";

import { RoleEntity } from "./entities/role.entity";

import { MockedService } from "test/utils/mocked-service.type";

import { RolesController } from "./roles.controller";
import { RolesService } from "./roles.service";

describe("RolesController", () => {
	let controller: RolesController;
	let rolesServiceMock: Pick<
		MockedService<RolesService>,
		"create" | "findAllBySchool" | "findOne" | "update" | "remove"
	>;

	beforeEach(async () => {
		rolesServiceMock = {
			create: jest.fn().mockImplementation((dto: CreateRoleDto) =>
				plainToInstance(RoleEntity, {
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
						name: "Admin",
						schoolId,
						attributes: ["subjects:read", "dailySchedule:update"],
						userIds: ["507f191e810c19729de860ea"],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "2",
						name: "Teacher",
						schoolId,
						attributes: ["subjects:read"],
						userIds: ["507f191e810c19729de860eb"],
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				].map(role => plainToInstance(RoleEntity, role))
			),
			findOne: jest.fn().mockImplementation((id: string) =>
				plainToInstance(RoleEntity, {
					id,
					name: "Admin",
					schoolId: "507f191e810c19729de860ea",
					attributes: ["subjects:read", "dailySchedule:update"],
					userIds: ["507f191e810c19729de860ea"],
					createdAt: new Date(),
					updatedAt: new Date(),
					deleted: false,
					deletedAt: null,
				})
			),
			update: jest
				.fn()
				.mockImplementation((id: string, dto: CreateRoleDto) =>
					plainToInstance(RoleEntity, {
						id,
						...dto,
						createdAt: new Date(),
						updatedAt: new Date(),
					})
				),
			remove: jest.fn().mockImplementation((id: string) =>
				plainToInstance(RoleEntity, {
					id,
					name: "Deleted Role",
					schoolId: "507f191e810c19729de860ea",
					attributes: [],
					userIds: [],
					createdAt: new Date(),
					updatedAt: new Date(),
					deleted: true,
					deletedAt: new Date(),
				})
			),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [RolesController],
			providers: [RolesService],
		})
			.overrideProvider(RolesService)
			.useValue(rolesServiceMock)
			.compile();

		controller = module.get<RolesController>(RolesController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("create", () => {
		it("should create a new role", async () => {
			const createRoleDto: CreateRoleDto = {
				name: "Admin",
				schoolId: "507f191e810c19729de860ea",
				attributes: ["subjects:read", "dailySchedule:update"],
			};

			const expected = new RoleEntity({
				id: "1",
				...createRoleDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.create(createRoleDto)).toEqual(expected);
			expect(rolesServiceMock.create).toHaveBeenCalledWith(createRoleDto);
		});
	});

	describe("findAllBySchool", () => {
		it("should return an array of roles for a school", async () => {
			const schoolId = "507f191e810c19729de860ea";

			const result = await controller.findAllBySchool(schoolId);

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
			result.forEach(item => expect(item).toBeInstanceOf(RoleEntity));
			expect(rolesServiceMock.findAllBySchool).toHaveBeenCalledWith(
				schoolId
			);
		});
	});

	describe("findOne", () => {
		it("should return a single role by ID", async () => {
			const id = "1";

			const expected = new RoleEntity({
				id: id,
				name: "Admin",
				schoolId: "507f191e810c19729de860ea",
				attributes: ["subjects:read", "dailySchedule:update"],
				userIds: ["507f191e810c19729de860ea"],
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.findOne(id)).toEqual(expected);
			expect(rolesServiceMock.findOne).toHaveBeenCalledWith(id);
		});
	});

	describe("update", () => {
		it("should update a role by ID", async () => {
			const id = "1";

			const updateRoleDto: UpdateRoleDto = {
				schoolId: "507f191e810c19729de860ea",
				attributes: ["subjects:update"],
				userIds: ["507f191e810c19729de860eb"],
			};

			const expected = new RoleEntity({
				id,
				...updateRoleDto,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
			});

			expect(await controller.update(id, updateRoleDto)).toEqual(
				expected
			);
			expect(rolesServiceMock.update).toHaveBeenCalledWith(
				id,
				updateRoleDto
			);
		});
	});

	describe("remove", () => {
		it("should remove a role by ID", async () => {
			const id = "1";

			const expected = new RoleEntity({
				id,
				name: "Deleted Role",
				schoolId: "507f191e810c19729de860ea",
				attributes: [],
				userIds: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				deleted: true,
				deletedAt: new Date(),
			});

			expect(await controller.remove(id)).toEqual(expected);
			expect(rolesServiceMock.remove).toHaveBeenCalledWith(id);
		});
	});
});
