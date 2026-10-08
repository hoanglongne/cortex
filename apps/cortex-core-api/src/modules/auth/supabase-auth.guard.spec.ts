import {
  Controller,
  Get,
  INestApplication,
  Param,
  UseGuards,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SupabaseAuthGuard, jwtExpiry } from './supabase-auth.guard';
import { CurrentUserId, assertSameUser } from './current-user';
import { SupabaseService } from '../supabase/supabase.service';

const ALICE = '11111111-1111-4111-8111-111111111111';
const BOB = '22222222-2222-4222-8222-222222222222';

function fakeJwt(exp: number) {
  const b64 = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'HS256' })}.${b64({ exp })}.sig`;
}

const ALICE_TOKEN = fakeJwt(Math.floor(Date.now() / 1000) + 3600);

@Controller('things')
@UseGuards(SupabaseAuthGuard)
class ThingsController {
  @Get(':userId')
  get(@CurrentUserId() caller: string, @Param('userId') userId: string) {
    assertSameUser(caller, userId);
    return { ok: true, userId };
  }
}

describe('SupabaseAuthGuard (HTTP)', () => {
  let app: INestApplication;
  let server: Parameters<typeof request>[0];
  const getUser = jest.fn((token: string) =>
    Promise.resolve(
      token === ALICE_TOKEN
        ? { data: { user: { id: ALICE } }, error: null }
        : { data: { user: null }, error: { message: 'invalid JWT' } },
    ),
  );

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ThingsController],
      providers: [
        SupabaseAuthGuard,
        {
          provide: SupabaseService,
          useValue: { getClient: () => ({ auth: { getUser } }) },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Parameters<typeof request>[0];
  });

  afterAll(() => app.close());
  beforeEach(() => getUser.mockClear());

  it('rejects requests without a token', async () => {
    await request(server).get(`/things/${ALICE}`).expect(401);
  });

  it('rejects an invalid token', async () => {
    await request(server)
      .get(`/things/${ALICE}`)
      .set('Authorization', 'Bearer forged')
      .expect(401);
  });

  it("lets a user read their own data but not someone else's", async () => {
    await request(server)
      .get(`/things/${ALICE}`)
      .set('Authorization', `Bearer ${ALICE_TOKEN}`)
      .expect(200, { ok: true, userId: ALICE });
    await request(server)
      .get(`/things/${BOB}`)
      .set('Authorization', `Bearer ${ALICE_TOKEN}`)
      .expect(403);
  });
});

describe('SupabaseAuthGuard cache', () => {
  function ctx(token: string) {
    const req: { headers: Record<string, string>; userId?: string } = {
      headers: { authorization: `Bearer ${token}` },
    };
    return {
      req,
      context: {
        switchToHttp: () => ({ getRequest: () => req }),
      } as never,
    };
  }

  it('asks Supabase once per token, then serves it from cache', async () => {
    const getUser = jest.fn(() =>
      Promise.resolve({ data: { user: { id: ALICE } }, error: null }),
    );
    const guard = new SupabaseAuthGuard({
      getClient: () => ({ auth: { getUser } }),
    } as unknown as SupabaseService);

    const first = ctx(ALICE_TOKEN);
    await guard.canActivate(first.context);
    await guard.canActivate(ctx(ALICE_TOKEN).context);

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(first.req.userId).toBe(ALICE);
  });

  it('does not cache a token Supabase rejected', async () => {
    const getUser = jest.fn(() =>
      Promise.resolve({ data: { user: null }, error: { message: 'expired' } }),
    );
    const guard = new SupabaseAuthGuard({
      getClient: () => ({ auth: { getUser } }),
    } as unknown as SupabaseService);

    await expect(guard.canActivate(ctx('bad').context)).rejects.toThrow();
    await expect(guard.canActivate(ctx('bad').context)).rejects.toThrow();
    expect(getUser).toHaveBeenCalledTimes(2);
  });
});

describe('jwtExpiry', () => {
  it('reads exp in milliseconds', () => {
    expect(jwtExpiry(fakeJwt(100))).toBe(100_000);
  });
  it('returns null for garbage', () => {
    expect(jwtExpiry('nope')).toBeNull();
  });
});
