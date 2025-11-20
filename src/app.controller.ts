import { Controller, Get } from "@nestjs/common";

import { ApiGet } from "@decorators";

class Temp {
	status: string;
}

@Controller("/")
export class AppController {
	@ApiGet({
		type: Temp,
	})
	@Get()
	getStatus() {
		return { status: "ok" };
	}
}
