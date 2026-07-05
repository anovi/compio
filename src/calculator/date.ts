import { TimeLength } from "./result-values";

export function subtractDates(dateA: Date, dateB: Date): TimeLength {
    const diff = dateA.getTime() - dateB.getTime();
    return new TimeLength(diff);
}