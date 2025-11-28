import { Test, TestingModule } from "@nestjs/testing";

import { KratosService } from "./kratos.service";

describe("KratosService", () => {
	let service: KratosService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [KratosService],
		}).compile();

		service = module.get<KratosService>(KratosService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
