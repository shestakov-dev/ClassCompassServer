import { ApiSchema, PartialType } from "@nestjs/swagger";

import { CreateBuildingDto } from "./create-building.dto";

@ApiSchema({
	description: "The data required to update a building",
})
export class UpdateBuildingDto extends PartialType(CreateBuildingDto) {}
