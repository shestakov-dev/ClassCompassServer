import { Test, TestingModule } from "@nestjs/testing";

import { KetoService } from "./keto.service";

describe("KetoService", () => {
	let service: KetoService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [KetoService],
		}).compile();

		service = module.get<KetoService>(KetoService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});
});
