import type Decimal from 'decimal.js';
import type { TimeLength } from './result-values';
import { isCurrency } from '../units';


export type Operator = '-' | '+' | '/' | '*' | '%' | '^';

type DecimalNaN = {
    // d: null,
    // e: typeof NaN,
    // s: typeof NaN,
    // isFinite: () => false,
}

export const ResultType = {
    number: 1,
    measure: 2,
    currency: 3,
    percent: 4,
    date: 100,
    timeSpan: 200,
} as const;

export type ResultType = typeof ResultType;
export type ResultTypeID = ResultType[keyof ResultType];

export type ExpressionResultNumber = {
    n: Decimal;
    unit?: string;
    /** Postfix literal such as `20%` (not a plain numeric value). */
    isPercent?: boolean;
    isPrimitive?: boolean;
    error?: string;
};

export type ExpressionResultDate = {
    date: Date;
    isPrimitive?: boolean;
    error?: string;
};

export type ExpressionResultTime = {
    time: TimeLength;
    isPrimitive?: boolean;
    error?: string;
};

export type ExpressionResultError = {
    n: Decimal & DecimalNaN;
    unit?: string;
    error: string;
    from: number;
    to: number;
    /** Canonical spellings the user can pick when {@link normalizeUnit} is ambiguous. */
    unitChoices?: readonly string[];
};

export type ExpressionResultOk = ExpressionResultNumber | ExpressionResultDate | ExpressionResultTime;

export type ExpressionResult = ExpressionResultOk | ExpressionResultError;
export type ExpressionNumericResult = ExpressionResultNumber | ExpressionResultError;

export function isExpressionResultError (res: unknown): res is ExpressionResultError  {
    return Boolean(typeof res === 'object' && res !== null && 'error' in res && res.error);
}

export function isExpressionResultNumber (res: unknown): res is ExpressionResultNumber {
    return Boolean(typeof res === 'object' && res !== null && 'n' in res && res.n);
}

export function isExpressionResultNumberUnit (res: unknown): res is ExpressionResultNumber & {
    unit: string;
} {
    return Boolean(typeof res === 'object' && res !== null && 'n' in res && 'unit' in res && res.unit);
}

export function isExpressionResultTime (res: unknown): res is ExpressionResultTime {
    return Boolean(typeof res === 'object' && res !== null && 'time' in res && res.time);
}

export function isExpressionResultPercent (res: unknown): res is ExpressionResultNumber & { isPercent: true }  {
    return Boolean(typeof res === 'object' && res !== null && 'isPercent' in res && res.isPercent);
}

export function isExpressionResultDate (res: unknown): res is ExpressionResultDate {
    return Boolean(typeof res === 'object' && res !== null && 'date' in res && res.date);
}

export function getResultType (res: unknown): ResultType[keyof ResultType] {
    if (isExpressionResultNumber(res)) {
        if (isExpressionResultNumberUnit(res)) {
            if (isCurrency(res.unit)) return ResultType.currency;
            return ResultType.measure
        }
        if (isExpressionResultPercent(res)) return ResultType.percent;
        return ResultType.number;
    }
    if (isExpressionResultTime(res)) return ResultType.timeSpan;
    if (isExpressionResultDate(res)) return ResultType.date;
    return ResultType.number;
}