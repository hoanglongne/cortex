import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { LexicaService } from './lexica.service';

/**
 * Public Lexica AI endpoints (no login needed to learn). Each is limited per
 * IP per day; cached results do not count.
 */
@Controller('v1/lexica')
export class LexicaController {
  constructor(private readonly lexica: LexicaService) {}

  @Post('reading')
  reading(@Body() body: unknown, @Req() req: Request) {
    return this.lexica.reading(body, who(req));
  }

  @Post('transcribe')
  transcribe(@Body() body: unknown, @Req() req: Request) {
    return this.lexica.transcribe(body, who(req));
  }

  @Get('tts')
  async tts(
    @Query() query: Record<string, unknown>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const wav = await this.lexica.tts(query, who(req));
    res.set({
      'Content-Type': 'audio/wav',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(wav);
  }
}

function who(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || req.ip || 'unknown';
}
