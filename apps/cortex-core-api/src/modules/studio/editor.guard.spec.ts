import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { EditorGuard } from './editor.guard';
import type { SupabaseService } from '../supabase/supabase.service';

function setup(isEditor: boolean) {
  const rpc = jest.fn().mockResolvedValue({ data: isEditor, error: null });
  const supabase = {
    clientForToken: () => ({ rpc }),
  } as unknown as SupabaseService;
  const ctx = (userId: string) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ userId, accessToken: 'jwt' }),
      }),
    }) as unknown as ExecutionContext;
  return { guard: new EditorGuard(supabase), rpc, ctx };
}

describe('EditorGuard', () => {
  it('checks the editor role once, then reuses it', async () => {
    const { guard, rpc, ctx } = setup(true);
    await expect(guard.canActivate(ctx('u1'))).resolves.toBe(true);
    await expect(guard.canActivate(ctx('u1'))).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('never caches a refusal', async () => {
    const { guard, rpc, ctx } = setup(false);
    await expect(guard.canActivate(ctx('u2'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(guard.canActivate(ctx('u2'))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(rpc).toHaveBeenCalledTimes(2);
  });
});
