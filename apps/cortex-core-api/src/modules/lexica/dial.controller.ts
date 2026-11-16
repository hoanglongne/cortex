import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import type { AuthedRequest } from '../auth/supabase-auth.guard';
import { dialBearer } from './dial';
import { DialService } from './dial.service';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

/** Signed-in learner (Lexica): link the extension, take its taps. */
@Controller('v1/lexica/dial')
@UseGuards(SupabaseAuthGuard)
export class DialAccountController {
  constructor(private readonly dial: DialService) {}

  @Post('token')
  issue(@Req() req: AuthedRequest) {
    return this.dial.issueToken(req.accessToken);
  }

  @Delete('token')
  revoke(@Req() req: AuthedRequest) {
    return this.dial.revokeToken(req.accessToken);
  }

  @Post('claim')
  @HttpCode(200)
  claim(@Req() req: AuthedRequest) {
    return this.dial.claimTaps(req.accessToken);
  }
}

/** The extension, with its dial token (Bearer lxd_…). */
@Controller('v1/lexica/dial/ext')
export class DialExtensionController {
  private readonly hits = new Map<string, { start: number; count: number }>();

  constructor(private readonly dial: DialService) {}

  private limit(ip: string) {
    const now = Date.now();
    const e = this.hits.get(ip);
    if (!e || now - e.start > WINDOW_MS) {
      if (this.hits.size > 10_000) this.hits.clear();
      this.hits.set(ip, { start: now, count: 1 });
      return;
    }
    if (++e.count > MAX_PER_WINDOW) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @Get('schedule')
  schedule(
    @Ip() ip: string,
    @Headers('authorization') authorization: string | undefined,
  ) {
    this.limit(ip);
    return this.dial.schedule(dialBearer(authorization));
  }

  @Post('taps')
  @HttpCode(200)
  taps(
    @Ip() ip: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ) {
    this.limit(ip);
    return this.dial.addTaps(dialBearer(authorization), body);
  }
}
