import { ApiSchema } from "@nestjs/swagger";
import { Room } from "@prisma/client";
import { plainToInstance, Type } from "class-transformer";

import { FloorEntity } from "@resources/floors/entities/floor.entity";

@ApiSchema({
	description: "A room object",
})
export class RoomEntity implements Room {
	static fromPlain(plain: Partial<RoomEntity>): RoomEntity {
		return plainToInstance(RoomEntity, plain, {
			exposeDefaultValues: true,
		});
	}

	/**
	 * The room's unique identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	id: string;

	/**
	 * The room's name
	 * @example "Chemistry Lab 1"
	 */
	name: string;

	/**
	 * The room's floor identifier
	 * @example "550e8400-e29b-41d4-a716-446655440000"
	 */
	floorId: string;

	/**
	 * The room's populated floor
	 */
	@Type(() => FloorEntity)
	floor?: FloorEntity;

	/**
	 * The time the room was created
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	createdAt: Date;

	/**
	 * The time the room was last updated
	 * @example "2021-09-01T00:00:00.000Z"
	 */
	updatedAt: Date;
}
