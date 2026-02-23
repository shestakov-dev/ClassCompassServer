import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";

@ApiSchema({
	description: "A presigned URL to download a floor plan SVG",
})
export class FloorPlanUrlEntity {
	static fromPlain(plain: Partial<FloorPlanUrlEntity>): FloorPlanUrlEntity {
		return plainToInstance(FloorPlanUrlEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	@ApiProperty({
		description: "The presigned URL to download the floor plan SVG",
		example:
			"https://minio.classcompass.shestakov.app/class-compass/floor-plans/...",
	})
	url: string;
}
