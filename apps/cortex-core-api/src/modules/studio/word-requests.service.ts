import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';

type Db = SupabaseClient<any, any, any>;

export interface WordRequest {
  word: string;
  /** Classes that asked for it (one row per assignment). */
  count: number;
  first_at: string;
}

/** Open requests, one per word, most asked first. Pure, unit tested. */
export function groupRequests(
  rows: readonly { word: string; created_at: string }[],
): WordRequest[] {
  const by = new Map<string, WordRequest>();
  for (const r of rows) {
    const word = r.word.trim().toLowerCase();
    const hit = by.get(word);
    if (hit) {
      hit.count++;
      if (r.created_at < hit.first_at) hit.first_at = r.created_at;
    } else by.set(word, { word, count: 1, first_at: r.created_at });
  }
  return [...by.values()].sort(
    (a, b) => b.count - a.count || a.first_at.localeCompare(b.first_at),
  );
}

/**
 * Words teachers assigned that Lexica has no card for yet
 * (lexica_word_requests, apps/lexica/supabase/migration_classes.sql).
 * Editors write the cards through a trend, then close the request.
 */
@Injectable()
export class WordRequestsService {
  async list(db: Db): Promise<WordRequest[]> {
    const res = await db
      .from('lexica_word_requests')
      .select('word, created_at')
      .eq('status', 'open')
      .order('created_at')
      .limit(1000);
    if (res.error)
      throw new InternalServerErrorException(
        `Lỗi database: ${res.error.message}`,
      );
    return groupRequests(
      (res.data ?? []) as { word: string; created_at: string }[],
    );
  }

  async done(db: Db, word: string) {
    const res = await db
      .from('lexica_word_requests')
      .update({ status: 'done' })
      .eq('status', 'open')
      .eq('word', word.trim().toLowerCase());
    if (res.error)
      throw new InternalServerErrorException(
        `Lỗi database: ${res.error.message}`,
      );
    return { word, status: 'done' };
  }
}
