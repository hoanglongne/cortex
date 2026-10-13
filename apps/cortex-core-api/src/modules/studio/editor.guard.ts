import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthedRequest } from '../auth/supabase-auth.guard';
import { SupabaseService } from '../supabase/supabase.service';

const EDITOR_CACHE_MS = 5 * 60 * 1000;

export type StudioRequest = AuthedRequest & {
  studioDb?: SupabaseClient<any, any, any>;
};

/**
 * Runs after SupabaseAuthGuard. Lets only Studio editors through and gives
 * the handler a Supabase client that acts as the editor, so every query is
 * still checked by row-level security.
 */
@Injectable()
export class EditorGuard implements CanActivate {
  /**
   * Users confirmed as editors recently. Skips one Supabase round trip per
   * request; safe because row-level security still checks every query.
   */
  private readonly editors = new Map<string, number>();

  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<StudioRequest>();
    if (!req.accessToken) throw new ForbiddenException('Not authenticated');

    const db = this.supabase.clientForToken(req.accessToken);
    if (!db) throw new ServiceUnavailableException('Supabase not configured');

    const now = Date.now();
    const known = req.userId ? this.editors.get(req.userId) : undefined;
    if (!known || known < now) {
      const res = await db.rpc('is_studio_editor');
      if (res.error || res.data !== true) {
        if (req.userId) this.editors.delete(req.userId);
        throw new ForbiddenException('Studio editors only');
      }
      if (req.userId) {
        if (this.editors.size > 1000) this.editors.clear();
        this.editors.set(req.userId, now + EDITOR_CACHE_MS);
      }
    }
    req.studioDb = db;
    return true;
  }
}

/** The editor-scoped Supabase client set by EditorGuard. */
export const StudioDb = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): SupabaseClient<any, any, any> => {
    const req = ctx.switchToHttp().getRequest<StudioRequest>();
    if (!req.studioDb) throw new ForbiddenException('Studio editors only');
    return req.studioDb;
  },
);
