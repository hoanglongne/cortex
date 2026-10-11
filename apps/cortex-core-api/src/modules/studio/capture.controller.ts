import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { parseCaptureInput } from './capture';
import { CaptureService } from './capture.service';

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

const bearer = (header: string | undefined) =>
  header?.match(/^Bearer\s+(\S+)$/i)?.[1];

/**
 * Public endpoint for the browser extension and the iOS Shortcut. Callers
 * authenticate with a capture token (Studio → Hệ thống), which can only add
 * captures for its owner.
 */
@Controller('capture')
export class CaptureController {
  private readonly hits = new Map<string, { start: number; count: number }>();

  constructor(private readonly captures: CaptureService) {}

  private limit(ip: string) {
    const now = Date.now();
    const entry = this.hits.get(ip);
    if (!entry || now - entry.start > WINDOW_MS) {
      if (this.hits.size > 10_000) this.hits.clear();
      this.hits.set(ip, { start: now, count: 1 });
      return;
    }
    entry.count++;
    if (entry.count > MAX_REQUESTS_PER_WINDOW) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @Get('check')
  check(
    @Ip() ip: string,
    @Headers('authorization') authorization: string | undefined,
  ) {
    this.limit(ip);
    return this.captures.checkToken(bearer(authorization));
  }

  @Post()
  @HttpCode(201)
  capture(
    @Ip() ip: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    this.limit(ip);
    return this.captures.captureWithToken(
      bearer(authorization),
      parseCaptureInput(body),
    );
  }
}
