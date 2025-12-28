import { Prisma } from "@prisma/client";

/**
 * Returns a Prisma filter for finding records that overlap with a given time range.
 *
 * @param start - The start of the time range
 * @param end - The end of the time range
 * @param inclusive - Whether to use inclusive comparison (<= and >=) or exclusive (< and >). Defaults to false.
 * @returns A Prisma where input for time filtering
 */
export function getTimeFilter(
	start: Date,
	end: Date,
	inclusive: boolean = false
): Prisma.LessonWhereInput {
	if (inclusive) {
		return {
			startTime: { lte: end },
			endTime: { gte: start },
		};
	}

	return {
		startTime: { lt: end },
		endTime: { gt: start },
	};
}
