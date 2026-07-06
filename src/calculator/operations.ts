import { TreeCursor } from '@lezer/common';
import {
    ResultType,
    getResultType,
    type ExpressionResult,
    type Operator,
    type ResultTypeID,
    type ExpressionResultNumber,
    type ExpressionResultError,
    type ExpressionResultOk,
    isExpressionResultDate,
    isExpressionResultTime,
    isExpressionResultNumber,
    isExpressionResultError,
    type ExpressionResultDate,
    type ExpressionResultTime
} from './types';
import Decimal from 'decimal.js';
import { isCurrency } from '../units';
import { subtractDates } from './date';


/*
# How to perform an operation?
1. Check if a given operator allowed for given operand types.
2. If there is units involved
    2.1. Find base unit.
3. Normalize argument by converting unit.
4. Perform operation.

# Types
- Number
- Number with unit
- Date
- TimeLength
*/

type OperatorRule = {
    left: ResultTypeID[];
    right: ResultTypeID[];
    handler: (left: any, right: any, baseUnit?: string) => ExpressionResult;
}

const OperatorsRulesMap = new Map<Operator, OperatorRule[]>;

function addRule(op: Operator, rule: OperatorRule) {
    const rules = OperatorsRulesMap.get(op) || [];
    rules.push(rule);
    OperatorsRulesMap.set(op, rules);
}

function expressionError(message: string, cursor: TreeCursor, unit?: string): ExpressionResultError {
    return { n: new Decimal(NaN), unit, error: message, from: cursor.from, to: cursor.to };
}

function resultToString(res: ExpressionResultOk): string {
    if (isExpressionResultDate(res)) {
        return res.date.toString();
    }
    else if (isExpressionResultTime(res)) {
        return res.toString();
    }
    return res.n.toString() + res.unit ? ' ' + res.unit : '';
}

/* -----------------------------------------------------------------------
|
| API
|
----------------------------------------------------------------------- */ 

type CalcContext = {
    cursor: TreeCursor,
    normalizeArg: (cursor: TreeCursor, arg: ExpressionResult, baseUnit?: string ) => ExpressionResult,
}

export function performBinaryOperation(
    operator: Operator,
    left: ExpressionResultOk,
    right: ExpressionResultOk,
    ctx: CalcContext,
    baseUnit?: string,
): ExpressionResult {
    const rules = OperatorsRulesMap.get(operator);
    if (!rules) throw Error('Unknown operator');
    const leftType = getResultType(left);
    const rightType = getResultType(right);

    // Special case
    if (operator === '*' && isExpressionResultNumber(left) && isExpressionResultNumber(right)) {
        const leftIsCurrency = left.unit && isCurrency(left.unit);
        const rightIsCurrency = right.unit && isCurrency(right.unit);
        const baseUnit = leftIsCurrency && !rightIsCurrency
            ? left.unit
            : rightIsCurrency && !leftIsCurrency ? right.unit : null;
        // currencies are compatible with other units in multiplying
        // and produce a currency result
        if (baseUnit) return { n: left.n.times(right.n), unit: baseUnit };
    }

    // Normalize to base unit
    const leftN = ctx.normalizeArg(ctx.cursor, left, baseUnit)
    if (isExpressionResultError(leftN)) return leftN;
    const rightN = ctx.normalizeArg(ctx.cursor, right, baseUnit)
    if (isExpressionResultError(rightN)) return rightN;

    for (let index = 0; index < rules.length; index++) {
        const rule = rules[index];
        if (rule.left.includes(leftType) && rule.right.includes(rightType)) {
            return rule.handler(leftN, rightN, baseUnit);
        }
    }
    if (leftType === ResultType.percent || rightType === ResultType.percent) {
        return expressionError('Percentage must be used with +, -, or *.', ctx.cursor, 'unit' in left ? left.unit : undefined);
    }
    return expressionError(
        `Incompatible operands for operator ${operator}: ${resultToString(left)}, ${resultToString(right)}`,
        ctx.cursor,
        'unit' in leftN ? leftN.unit : undefined
    );
}

/* -----------------------------------------------------------------------
| Application code.
|
| Here were configurate which operation for which pairs are possible.
------------------------------------------------------------------------ */

type FnName = 'add' | 'minus' | 'div' | 'mod' | 'times' | 'pow';

function numbersBinaryHandler(
    fn: FnName,
    left: ExpressionResultNumber,
    right: ExpressionResultNumber,
    baseUnit?: string
) {
    return {
        n: left.n[fn](right.n),
        type: ResultType.number,
        unit: baseUnit,
    } as ExpressionResultNumber
}

function numbersRatioBinaryHandler(
    fn: FnName,
    left: ExpressionResultNumber,
    right: ExpressionResultNumber,
) {
    return {
        n: left.n[fn](right.n),
        type: ResultType.number,
        // Produces no unit!
    } as ExpressionResultNumber
}

function percentPlusBinaryHandler(
    fn: FnName,
    left: ExpressionResultNumber,
    right: ExpressionResultNumber & { isPercent: true },
    baseUnit?: string,
) {
    const portion = left.n.times(right.n.div(100));
    return {
        n: left.n[fn](portion),
        type: ResultType.number,
        unit: baseUnit
    } as ExpressionResultNumber;
}

function datesHandler(
    left: ExpressionResultDate,
    right: ExpressionResultDate,
): ExpressionResultTime {
    const time = subtractDates(left.date, right.date);
    return { time } as ExpressionResultTime
}

/* --------------------- Plus operator --------------------- */

addRule('+', {
    left: [ResultType.number, ResultType.measure],
    right: [ResultType.number, ResultType.measure],
    handler: numbersBinaryHandler.bind(null, 'add'),
})
addRule('+', {
    left: [ResultType.number, ResultType.currency],
    right: [ResultType.number, ResultType.currency],
    handler: numbersBinaryHandler.bind(null, 'add'),
})
addRule('+', {
    left: [ResultType.number],
    right: [ResultType.percent],
    handler: percentPlusBinaryHandler.bind(null, 'add'),
})

/* --------------------- Minus operator --------------------- */

addRule('-', {
    left: [ResultType.number, ResultType.measure],
    right: [ResultType.number, ResultType.measure],
    handler: numbersBinaryHandler.bind(null, 'minus'),
})
addRule('-', {
    left: [ResultType.number, ResultType.currency],
    right: [ResultType.number, ResultType.currency],
    handler: numbersBinaryHandler.bind(null, 'minus'),
})
addRule('-', {
    left: [ResultType.number, ResultType.measure, ResultType.currency],
    right: [ResultType.percent],
    handler: percentPlusBinaryHandler.bind(null, 'minus'),
})
addRule('-', {
    left: [ResultType.date],
    right: [ResultType.date],
    handler: datesHandler.bind(null),
})

/* --------------------- Times operator --------------------- */

addRule('*', {
    left: [ResultType.number, ResultType.measure],
    right: [ResultType.measure, ResultType.currency, ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'times'),
})
addRule('*', {
    left: [ResultType.measure, ResultType.currency, ResultType.number],
    right: [ResultType.number, ResultType.measure],
    handler: numbersBinaryHandler.bind(null, 'times'),
})
addRule('*', {
    left: [ResultType.number, ResultType.measure, ResultType.currency],
    right: [ResultType.percent],
    handler: (
        left: ExpressionResultNumber,
        right: ExpressionResultNumber & { isPercent: true },
        baseUnit?: string,
    ) => {
        return {
            n: left.n.times(right.n.div(100)),
            type: ResultType.number,
            unit: baseUnit
        } as ExpressionResultNumber;
    },
})

/* --------------------- Pow operator --------------------- */

addRule('^', {
    left: [ResultType.measure, ResultType.currency, ResultType.number],
    right: [ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'pow'),
})

/* --------------------- Divide operator --------------------- */

addRule('/', {
    left: [ResultType.number],
    right: [ResultType.measure, ResultType.currency, ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'div'),
})
addRule('/', {
    left: [ResultType.measure, ResultType.currency, ResultType.number],
    right: [ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'div'),
})
addRule('/', {
    left: [ResultType.measure],
    right: [ResultType.measure],
    handler: numbersRatioBinaryHandler.bind(null, 'div'),
})
addRule('/', {
    left: [ResultType.currency],
    right: [ResultType.currency],
    handler: numbersRatioBinaryHandler.bind(null, 'div'),
})
addRule('/', {
    left: [ResultType.percent],
    right: [ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'div'),
})

/* --------------------- Mod operator --------------------- */

addRule('%', {
    left: [ResultType.number],
    right: [ResultType.measure, ResultType.currency, ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'mod'),
})
addRule('%', {
    left: [ResultType.measure, ResultType.currency, ResultType.number],
    right: [ResultType.number],
    handler: numbersBinaryHandler.bind(null, 'mod'),
})
addRule('%', {
    left: [ResultType.measure],
    right: [ResultType.measure],
    handler: numbersRatioBinaryHandler.bind(null, 'mod'),
})
addRule('%', {
    left: [ResultType.currency],
    right: [ResultType.currency],
    handler: numbersRatioBinaryHandler.bind(null, 'mod'),
})