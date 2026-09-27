import Decimal from 'decimal.js';
import convert, { getMeasureKind, type Unit } from 'convert';
import { conversions } from 'convert/conversions';

import { UnitType, type MeasureEntry, type UnitsConverter } from '../types';

export const units: MeasureEntry[] = [];
for (const [_key, entry] of conversions) {
  entry.units.forEach((unitDef) => {
    units.push({
        type: UnitType.measure,
        names: unitDef.names,
        symbols: unitDef.symbols,
    });
  });
}

export { convert, getMeasureKind };
export { MeasureKind } from 'convert';
export type { Unit };

export const convertPackageUnitsConverter: UnitsConverter = {
  canConvert(unitA: string, unitB: string): boolean {
    const kindA = getMeasureKind(unitA);
    const kindB = getMeasureKind(unitB);
    return kindA != null && kindA === kindB;
  },

  convertValue(value: Decimal, unitA: string, unitB: string): Decimal {
    const res = convert(value.toNumber(), unitA as Unit).to(unitB as Unit);
    return new Decimal(res);
  },
};
