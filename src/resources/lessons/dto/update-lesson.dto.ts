import { ApiSchema, PartialType } from "@nestjs/swagger";

import { CreateLessonDto } from "./create-lesson.dto";

@ApiSchema({
	description: "The data required to update an existing lesson",
})
export class UpdateLessonDto extends PartialType(CreateLessonDto) {}
