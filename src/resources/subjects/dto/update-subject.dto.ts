import { ApiSchema, PartialType } from "@nestjs/swagger";

import { CreateSubjectDto } from "./create-subject.dto";

@ApiSchema({
	description: "The data required to update a subject",
})
export class UpdateSubjectDto extends PartialType(CreateSubjectDto) {}
