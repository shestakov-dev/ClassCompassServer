import { ApiSchema } from "@nestjs/swagger";
import { Floor } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { BuildingEntity } from "@resources/buildings/entities/building.entity";
import { RoomEntity } from "@resources/rooms/entities/room.entity";

@ApiSchema({
	description: "A floor object",
})
export class FloorEntity implements Floor {
	static fromPlain(plain: Partial<FloorEntity>): FloorEntity {
		return plainToInstance(FloorEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The floor's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The floor's number
	 * @example 3
	 */
	number: number;

	/**
	 * The floor's description
	 * @example "Third floor of the main building"
	 */
	description: string | null = null;

	/**
	 * The ETag of the floor plan object in object storage, if any.
	 * Can be used by clients for cache validation.
	 * @example "d41d8cd98f00b204e9800998ecf8427e"
	 */
	floorPlanETag: string | null = null;

	/**
	 * The floor's building identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	buildingId: string;

	/**
	 * The floor's populated building
	 */
	@Type(() => BuildingEntity)
	building?: BuildingEntity;

	/**
	 * The floor's populated rooms
	 */
	@Type(() => RoomEntity)
	rooms?: RoomEntity[];

	/**
	 * The time the floor was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the floor was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;
}
