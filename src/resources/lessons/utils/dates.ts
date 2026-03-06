import { UTCDate } from "@date-fns/utc";
import { Day, LessonWeek } from "@prisma/client";
import { getDay, getISOWeek, set } from "date-fns";

// Maps JS getDay() index (0 = Sunday) to Prisma Day enum values
const UTC_DAY_INDEX_TO_PRISMA_DAY: Record<number, Day> = {
	0: Day.sunday,
	1: Day.monday,
	2: Day.tuesday,
	3: Day.wednesday,
	4: Day.thursday,
	5: Day.friday,
	6: Day.saturday,
};

/**
 * Extracts the day-of-week from a Date, evaluated in UTC context.
 *
 * @param date - The Date to extract the day from
 * @returns The Prisma Day enum value for that day
 */
export function getDayFromDate(date: Date): Day {
	const utcDate = new UTCDate(date);

	return UTC_DAY_INDEX_TO_PRISMA_DAY[getDay(utcDate)];
}

/**
 * Determines the odd/even week parity from a Date's ISO week number (UTC context).
 * ISO week numbers are stable and locale-independent.
 *
 * @param date - The Date to evaluate
 * @returns LessonWeek.even for even ISO weeks, LessonWeek.odd for odd ones
 */
export function getWeekParityFromDate(date: Date): LessonWeek {
	const utcDate = new UTCDate(date);

	const weekNumber = getISOWeek(utcDate);

	return weekNumber % 2 === 0 ? LessonWeek.even : LessonWeek.odd;
}

/**
 * Takes a Date object and sets its date to January 1, 1970.
 * This is useful for normalizing time comparisons where only the time portion matters.
 *
 * @param date - The original Date object
 * @returns A new Date object with the date set to January 1, 1970
 */
export function normalizeDate(date: Date): Date {
	// Wrap in UTCDate so the local time zone offset is ignored
	const utcContextDate = new UTCDate(date);

	return set(utcContextDate, {
		year: 1970,
		month: 0,
		date: 1,
	});
}
