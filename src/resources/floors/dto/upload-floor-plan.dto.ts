import { ApiProperty, ApiSchema } from "@nestjs/swagger";

@ApiSchema({
	description: "The data required to upload a floor plan for a floor",
})
export class UploadFloorPlanDto {
	/**
	 * The floor plan SVG file to upload (Max 2MB)
	 */
	@ApiProperty({
		type: "string",
		format: "binary",
	})
	file: any;
}
