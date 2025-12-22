import { ApiSchema } from "@nestjs/swagger";
import { Building } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { SchoolEntity } from "@resources/schools/entities/school.entity";

@ApiSchema({
	description: "A building object",
})
export class BuildingEntity implements Building {
	static fromPlain(plain: Partial<BuildingEntity>): BuildingEntity {
		return plainToInstance(BuildingEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The building's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The building's name
	 * @example "Main Building"
	 */
	name: string;

	/**
	 * The building's school identifier
	 * @example "550e8400-e29b-41d4-a716-446655440001"
	 */
	schoolId: string;

	/**
	 * The building's populated school
	 */
	@Type(() => SchoolEntity)
	school?: SchoolEntity;

	/**
	 * The date the building was created
	 * @example "2023-01-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The date the building was last updated
	 * @example "2023-01-01T00:00:00.000Z"
	 */
	updatedAt: Date;

	/**
	 * Whether the building is deleted
	 * @example false
	 */
	deleted: boolean = false;

	/**
	 * The date the building was deleted
	 * @example "2023-01-01T00:00:00.000Z"
	 */
	deletedAt: Date | null = null;
}
