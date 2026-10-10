import { BadRequestException } from '@nestjs/common';
import { LEVELS, type Level } from './studio.types';

type Obj = Record<string, unknown>;

export function obj(body: unknown): Obj {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException('Body must be a JSON object');
  }
  return body as Obj;
}

export function str(
  o: Obj,
  key: string,
  opts: { max?: number; optional?: boolean } = {},
): string | undefined {
  const v = o[key];
  if (v === undefined || v === null || v === '') {
    if (opts.optional) return undefined;
    throw new BadRequestException(`${key} is required`);
  }
  if (typeof v !== 'string')
    throw new BadRequestException(`${key} must be a string`);
  const t = v.trim();
  if (opts.max && t.length > opts.max) {
    throw new BadRequestException(`${key} is longer than ${opts.max}`);
  }
  return t;
}

export function strList(o: Obj, key: string, max = 20): string[] {
  const v = o[key];
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) {
    throw new BadRequestException(`${key} must be a list of strings`);
  }
  return (v as string[])
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, max);
}

export function level(o: Obj, key: string): Level | undefined {
  const v = o[key];
  if (v === undefined || v === null) return undefined;
  if (!LEVELS.includes(v as Level)) {
    throw new BadRequestException(`${key} must be one of ${LEVELS.join(', ')}`);
  }
  return v as Level;
}

export function int(
  o: Obj,
  key: string,
  min: number,
  max: number,
): number | undefined {
  const v = o[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) {
    throw new BadRequestException(`${key} must be an integer ${min}–${max}`);
  }
  return v;
}

export function isoDate(o: Obj, key: string): string | undefined {
  const v = str(o, key, { optional: true });
  if (v === undefined) return undefined;
  if (Number.isNaN(Date.parse(v))) {
    throw new BadRequestException(`${key} must be an ISO date`);
  }
  return new Date(v).toISOString();
}

export function oneOf<T extends string>(
  o: Obj,
  key: string,
  values: readonly T[],
): T | undefined {
  const v = o[key];
  if (v === undefined || v === null) return undefined;
  if (!values.includes(v as T)) {
    throw new BadRequestException(`${key} must be one of ${values.join(', ')}`);
  }
  return v as T;
}

/** ISO week id, e.g. drop-2026-w42 */
export function weekDropId(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `drop-${d.getUTCFullYear()}-w${String(week).padStart(2, '0')}`;
}
