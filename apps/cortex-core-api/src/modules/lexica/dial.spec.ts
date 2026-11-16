import { UnauthorizedException } from '@nestjs/common';
import { dialBearer, hashDialToken, newDialToken, parseDialTaps } from './dial';
import { DialService } from './dial.service';
import type { SupabaseService } from '../supabase/supabase.service';

describe('dial tokens and taps', () => {
  it('makes prefixed tokens and reads only dial bearers', () => {
    const t = newDialToken();
    expect(t.startsWith('lxd_')).toBe(true);
    expect(hashDialToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(dialBearer(`Bearer ${t}`)).toBe(t);
    expect(dialBearer('Bearer lxs_capture')).toBeNull();
    expect(dialBearer(undefined)).toBeNull();
  });

  it('keeps valid recent taps, one per card', () => {
    const now = 1_800_000_000_000;
    const taps = parseDialTaps(
      {
        taps: [
          { cardId: 'v004', at: now - 5 },
          { cardId: 'v004', at: now - 1 },
          { cardId: 'nope', at: now },
          { cardId: 'v005', at: now - 31 * 86_400_000 },
          { cardId: 'v006', at: 'x' },
        ],
      },
      now,
    );
    expect(taps).toEqual([{ cardId: 'v004', at: now - 1 }]);
    expect(parseDialTaps(null)).toEqual([]);
  });
});

describe('DialService', () => {
  const rpc = jest.fn();
  const supabase = {
    getClient: () => ({ rpc }),
    clientForToken: () => ({ rpc }),
  } as unknown as SupabaseService;
  const svc = new DialService(supabase);
  beforeEach(() => rpc.mockReset());

  it('issues a token and stores only its hash', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    const { token } = await svc.issueToken('jwt');
    expect(rpc).toHaveBeenCalledWith('lexica_dial_token_set', {
      p_token_hash: hashDialToken(token),
    });
  });

  it('rejects a missing or dead token', async () => {
    await expect(svc.schedule(null)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    rpc.mockResolvedValue({ data: null, error: null });
    await expect(svc.schedule('lxd_x')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    rpc.mockResolvedValue({ data: -1, error: null });
    await expect(svc.addTaps('lxd_x', { taps: [] })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns the schedule and maps claimed taps', async () => {
    rpc.mockResolvedValueOnce({ data: { v004: 123 }, error: null });
    await expect(svc.schedule('lxd_x')).resolves.toEqual({ v004: 123 });
    rpc.mockResolvedValueOnce({
      data: [{ card_id: 'v004', tapped_at: '2026-11-15T00:00:00Z' }],
      error: null,
    });
    await expect(svc.claimTaps('jwt')).resolves.toEqual([
      { cardId: 'v004', at: Date.parse('2026-11-15T00:00:00Z') },
    ]);
  });
});
