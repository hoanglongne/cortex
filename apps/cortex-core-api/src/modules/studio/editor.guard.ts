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
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<StudioRequest>();
    if (!req.accessToken) throw new ForbiddenException('Not authenticated');

    const db = this.supabase.clientForToken(req.accessToken);
    if (!db) throw new ServiceUnavailableException('Supabase not configured');

    const res = await db.rpc('is_studio_editor');
    if (res.error || res.data !== true) {
      throw new ForbiddenException('Studio editors only');
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
