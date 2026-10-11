import { createHash, randomBytes } from 'node:crypto';
import type { CardRow, DropRow } from './studio.types';

/** Must match apps/lexica/app/lib/content/pack.ts (schema 1). */
export interface PackCard {
  id: string;
  word: string;
  ipa?: string;
  elo: number;
  level: CardRow['level'];
  scenario: string;
  translationHint: string;
  revision: number;
  trend?: { label: string; dropId?: string; expiresAt?: string };
}

export interface Pack {
  schema: 1;
  id: string;
  title: string;
  publishedAt: string;
  cards: PackCard[];
}

export interface PackRef {
  id: string;
  url: string;
  sha256: string;
}

export interface Manifest {
  schema: 1;
  updatedAt: string;
  current: PackRef | null;
  library: PackRef | null;
  retired: string[];
}

/** New Studio card id: 't' + 7 base36 chars. Core cards use 'v###'. */
export function newCardId(bytes: () => Buffer = () => randomBytes(5)): string {
  const n = bytes().readUIntBE(0, 5);
  return `t${n.toString(36).padStart(7, '0').slice(-7)}`;
}

export function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Content-addressed file name, so a pack URL can be cached forever. */
export function packPath(packId: string, hash: string): string {
  return `packs/${packId}.${hash.slice(0, 12)}.json`;
}

function toPackCard(
  card: CardRow,
  trend: PackCard['trend'] | undefined,
): PackCard {
  return {
    id: card.id,
    word: card.word.toUpperCase(),
    ...(card.ipa ? { ipa: card.ipa } : {}),
    elo: card.elo,
    level: card.level,
    scenario: card.scenario,
    translationHint: card.translation_hint,
    revision: card.revision,
    ...(trend ? { trend } : {}),
  };
}

/** The live drop: dealt to learners until the drop expires. */
export function buildDropPack(
  drop: Pick<DropRow, 'id' | 'title' | 'expires_at'>,
  cards: CardRow[],
  publishedAt: string,
): Pack {
  return {
    schema: 1,
    id: drop.id,
    title: drop.title,
    publishedAt,
    cards: cards
      .filter((c) => c.lifecycle !== 'retired')
      .map((c) =>
        toPackCard(c, {
          label: c.trend_label ?? drop.title,
          dropId: drop.id,
          ...(drop.expires_at && c.lifecycle === 'trend'
            ? { expiresAt: drop.expires_at }
            : {}),
        }),
      ),
  };
}

/**
 * Every other published card. Evergreen cards stay dealable; past trend
 * cards are marked expired and retired ones listed in the manifest, so
 * learners who already have them can still look them up and review them.
 */
export function buildLibraryPack(
  cards: CardRow[],
  expiredBefore: string,
  publishedAt: string,
): Pack {
  return {
    schema: 1,
    id: `library-${publishedAt.slice(0, 10)}`,
    title: 'Library',
    publishedAt,
    cards: cards.map((c) =>
      toPackCard(
        c,
        c.trend_label
          ? {
              label: c.trend_label,
              ...(c.lifecycle === 'trend' ? { expiresAt: expiredBefore } : {}),
            }
          : undefined,
      ),
    ),
  };
}
