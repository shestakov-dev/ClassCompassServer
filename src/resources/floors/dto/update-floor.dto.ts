import { ApiSchema, PartialType } from "@nestjs/swagger";

import { CreateFloorDto } from "./create-floor.dto";

@ApiSchema({
	description: "The data required to update a floor",
})
export class UpdateFloorDto extends PartialType(CreateFloorDto) {}
