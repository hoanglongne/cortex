import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Set at the very start of a request (main.ts), to measure the guards too. */
export type TimedRequest = Request & { startedAtMs?: number };

/**
 * Tells the Studio how long the API took, so slowness can be split between the
 * network, the API and the database (issue #112): `X-Studio-Guard-Ms` is the
 * time until the handler started (login and editor checks), `X-Studio-Ms` is
 * the whole time inside the API. Numbers only.
 */
@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<TimedRequest>();
    const res = http.getResponse<Response>();
    const started = req.startedAtMs ?? Date.now();
    const guardMs = Date.now() - started;
    return next.handle().pipe(
      tap(() => {
        if (res.headersSent) return;
        res.setHeader('X-Studio-Guard-Ms', String(guardMs));
        res.setHeader('X-Studio-Ms', String(Date.now() - started));
      }),
    );
  }
}
