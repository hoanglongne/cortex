import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import type { AuthedRequest } from './supabase-auth.guard';

/** The user id verified by SupabaseAuthGuard. */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (!req.userId) throw new ForbiddenException('Not authenticated');
    return req.userId;
  },
);

/** Throws 403 unless the requested user is the caller. */
export function assertSameUser(callerId: string, requestedId: unknown) {
  if (requestedId !== callerId) {
    throw new ForbiddenException("Cannot access another user's data");
  }
}
