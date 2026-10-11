import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service';

export type AuthedRequest = Request & { userId?: string; accessToken?: string };

type CacheEntry = { userId: string; expiresAt: number };

/** Re-verify a token with Supabase at most this often. */
const MAX_CACHE_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 1000;

/**
 * Requires `Authorization: Bearer <Supabase access token>` from the
 * shared Supabase project and puts the verified user id on the request.
 * Controllers must compare it with any userId the client sends.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) throw new UnauthorizedException('Missing bearer token');

    req.userId = await this.verify(token);
    req.accessToken = token;
    return true;
  }

  private async verify(token: string): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get(token);
    if (cached && cached.expiresAt > now) return cached.userId;

    const client = this.supabaseService.getClient();
    if (!client) throw new UnauthorizedException('Auth unavailable');

    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      this.cache.delete(token);
      throw new UnauthorizedException('Invalid or expired token');
    }

    const tokenExp = jwtExpiry(token) ?? now + MAX_CACHE_MS;
    this.remember(token, {
      userId: data.user.id,
      expiresAt: Math.min(tokenExp, now + MAX_CACHE_MS),
    });
    return data.user.id;
  }

  private remember(token: string, entry: CacheEntry) {
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const [oldest] = this.cache.keys();
      if (oldest !== undefined) this.cache.delete(oldest);
    }
    this.cache.set(token, entry);
  }
}

/** Reads `exp` (ms) from a JWT without verifying it; verification is Supabase's job. */
export function jwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64url').toString('utf8');
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}
