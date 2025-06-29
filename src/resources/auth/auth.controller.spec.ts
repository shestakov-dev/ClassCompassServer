import { Test, TestingModule } from "@nestjs/testing";
import { Session, User } from "@prisma/client";
import { plainToInstance } from "class-transformer";

import { TokensEntity } from "@resources/sessions/entities/tokens.entity";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
	let controller: AuthController;
	let authServiceMock: Pick<AuthService, "login" | "refresh" | "logout">;

	beforeEach(async () => {
		authServiceMock = {
			login: jest.fn().mockImplementation(() =>
				plainToInstance(TokensEntity, {
					accessToken: "mockAccessToken",
					refreshToken: "mockRefreshToken",
				})
			),
			refresh: jest.fn().mockImplementation(() =>
				plainToInstance(TokensEntity, {
					accessToken: "mockNewAccessToken",
					refreshToken: "mockNewRefreshToken",
				})
			),
			logout: jest.fn().mockImplementation(() => undefined),
		};

		const module: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [AuthService],
		})
			.overrideProvider(AuthService)
			.useValue(authServiceMock)
			.compile();

		controller = module.get<AuthController>(AuthController);
	});

	it("should be defined", () => {
		expect(controller).toBeDefined();
	});

	describe("login", () => {
		it("should log in a user and return tokens", async () => {
			const mockUser: User = {
				id: "user123",
				name: "Test User",
				email: "test@example.com",
				password: "hashedPassword",
				schoolId: "school123",
				roleIds: ["role123"],
				createdAt: new Date(),
				updatedAt: new Date(),
				deleted: false,
				deletedAt: null,
			};

			const expectedTokens = plainToInstance(TokensEntity, {
				accessToken: "mockAccessToken",
				refreshToken: "mockRefreshToken",
			});

			expect(await controller.login(mockUser)).toEqual(expectedTokens);
			expect(authServiceMock.login).toHaveBeenCalledWith(mockUser);
		});
	});

	describe("refresh", () => {
		it("should refresh tokens for a valid session", async () => {
			const mockSession: Session = {
				id: "session123",
				userId: "user123",
				refreshToken: "hashedRefreshToken",
				createdAt: new Date(),
				updatedAt: new Date(),
				deleted: false,
				deletedAt: null,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
			};

			const expectedTokens = plainToInstance(TokensEntity, {
				accessToken: "mockNewAccessToken",
				refreshToken: "mockNewRefreshToken",
			});

			expect(await controller.refresh(mockSession)).toEqual(
				expectedTokens
			);
			expect(authServiceMock.refresh).toHaveBeenCalledWith(mockSession);
		});
	});

	describe("logout", () => {
		it("should log out a user by revoking their session", async () => {
			const mockSession: Session = {
				id: "session123",
				userId: "user123",
				refreshToken: "hashedRefreshToken",
				createdAt: new Date(),
				updatedAt: new Date(),
				deleted: false,
				deletedAt: null,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
			};

			controller.logout(mockSession);

			expect(authServiceMock.logout).toHaveBeenCalledWith(mockSession);
		});
	});
});
