
export class TimeLength {
    /** Length in milliseconds  */
    readonly length: number;

    constructor(length: number) {
        this.length = length;
    }

    toString(): string {
        return String(this.length);
    }
}