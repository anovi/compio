import Decimal from 'decimal.js';
import { RangeValue } from "@codemirror/state";

import { TimeLength } from './result-values';
import { isExpressionResultDate, isExpressionResultError, isExpressionResultPercent, isExpressionResultTime, type ExpressionResult } from './types';


/** Represents line's calculation result; can be binded to a name */
export class CalcValue<T = Decimal | Date | TimeLength> extends RangeValue {
    readonly result: T
    readonly dependencies?: string[];
    readonly name?: string;
    readonly unit?: string;
    readonly error?: string;
    readonly errorFrom?: number;
    readonly errorTo?: number;
    readonly unitChoices?: readonly string[];
    /** Means the expression is just a value assignment without calculation.  */
    readonly primitive?: boolean;
    constructor(
        result: T,
        name?: string,
        dependencies?: string[],
        unit?: string,
        error?: string,
        errorFrom?: number,
        errorTo?: number,
        unitChoices?: readonly string[],
        isPrimitive?: boolean,
    ) {
        super();
        this.result = result;
        this.name = name;
        this.dependencies = dependencies;
        this.unit = unit;
        this.error = error;
        this.errorFrom = errorFrom;
        this.errorTo = errorTo;
        this.unitChoices = unitChoices;
        this.primitive = isPrimitive;
    }
}

export function calcValueFromExpr(expr: ExpressionResult, name?: string): CalcValue {
    const isError = isExpressionResultError(expr);
    if (isExpressionResultTime(expr)) {
        return new CalcValue(
            expr.time,
            name,
            undefined,
            undefined,
            expr.error,
            isError ? expr.from : undefined,
            isError ? expr.to : undefined,
            undefined,
            !isError && expr.isPrimitive
        )
    }
    if (isExpressionResultDate(expr)) {
        return new CalcValue(
            expr.date,
            name,
            undefined,
            undefined,
            expr.error,
            isError ? expr.from : undefined,
            isError ? expr.to : undefined,
            undefined,
            !isError && expr.isPrimitive
        )
    }
    const n = expr.n ?? new Decimal(NaN);
    return new CalcValue(
        n,
        name,
        undefined,
        isExpressionResultPercent(expr) ? '%' : expr.unit,
        expr.error,
        isError ? expr.from : undefined,
        isError ? expr.to : undefined,
        isError ? expr.unitChoices : undefined,
        !isError && expr.isPrimitive
    );
}