import { set } from "date-fns";

/**
 * Takes a Date object and sets its date to January 1, 1970.
 * This is useful for normalizing time comparisons where only the time portion matters.
 *
 * @param date - The original Date object
 * @returns A new Date object with the date set to January 1, 1970
 */
export function normalizeDate(date: Date): Date {
	return set(date, {
		year: 1970,
		month: 0,
		date: 1,
	});
}
