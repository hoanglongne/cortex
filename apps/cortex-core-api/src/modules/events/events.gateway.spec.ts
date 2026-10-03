import type { Server, Socket } from 'socket.io';
import { EventsGateway } from './events.gateway';

function makeSocket(id: string) {
  return {
    id,
    join: jest.fn(),
    leave: jest.fn(),
  } as unknown as Socket & { join: jest.Mock; leave: jest.Mock };
}

describe('EventsGateway presence', () => {
  let gateway: EventsGateway;
  let emit: jest.Mock;

  beforeEach(() => {
    gateway = new EventsGateway();
    emit = jest.fn();
    gateway.server = { emit } as unknown as Server;
  });

  it('joins the user room and counts distinct users per app', () => {
    const a = makeSocket('a');
    const b = makeSocket('b');
    const c = makeSocket('c');

    gateway.handleIdentify(a, { userId: 'u1', appSource: 'lexica' });
    gateway.handleIdentify(b, { userId: 'u1', appSource: 'lexica' });
    gateway.handleIdentify(c, { userId: 'u2', appSource: 'oratio' });

    expect(a.join).toHaveBeenCalledWith('u1');
    expect(gateway.getPresence()).toEqual({
      onlineUsers: 2,
      byApp: { lexica: 1, oratio: 1 },
    });
    expect(emit).toHaveBeenLastCalledWith('presence:update', {
      onlineUsers: 2,
      byApp: { lexica: 1, oratio: 1 },
    });
  });

  it('drops a socket on disconnect and broadcasts the change', () => {
    const a = makeSocket('a');
    gateway.handleIdentify(a, { userId: 'u1', appSource: 'lexica' });
    emit.mockClear();

    gateway.handleDisconnect(a);

    expect(gateway.getPresence()).toEqual({ onlineUsers: 0, byApp: {} });
    expect(emit).toHaveBeenCalledWith('presence:update', {
      onlineUsers: 0,
      byApp: {},
    });
  });

  it('does not broadcast when an anonymous socket disconnects', () => {
    gateway.handleDisconnect(makeSocket('anon'));
    expect(emit).not.toHaveBeenCalled();
  });

  it('rejects identify without a userId', () => {
    const a = makeSocket('a');
    expect(gateway.handleIdentify(a, {})).toEqual({
      error: 'userId is required',
    });
    expect(a.join).not.toHaveBeenCalled();
  });

  it('moves rooms when a socket re-identifies as another user', () => {
    const a = makeSocket('a');
    gateway.handleIdentify(a, { userId: 'u1', appSource: 'lexica' });
    gateway.handleIdentify(a, { userId: 'u2', appSource: 'lexica' });
    expect(a.leave).toHaveBeenCalledWith('u1');
    expect(gateway.getPresence().onlineUsers).toBe(1);
  });
});
