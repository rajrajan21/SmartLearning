import { dailyIndex } from "@studysmart/shared";
/** Index of today's pick in a list of `size` items (same for everyone on a given date). */
export const dailyPick = (size: number, date: Date, salt: number): number => dailyIndex(date, size, salt);
