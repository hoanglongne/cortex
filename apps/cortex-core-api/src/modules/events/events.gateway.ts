import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

type PresenceIdentity = { userId: string; appSource: string };

export type PresenceSnapshot = {
  onlineUsers: number;
  byApp: Record<string, number>;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'events',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');
  /** socket id -> who is on it. In-memory: fine for a single API instance. */
  private readonly presence = new Map<string, PresenceIdentity>();

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    if (this.presence.delete(client.id)) {
      this.broadcastPresence();
    }
  }

  /**
   * Clients call this after connecting so they receive user-targeted events
   * (`sendToUser`) and count towards ecosystem presence.
   */
  @SubscribeMessage('identify')
  handleIdentify(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: Partial<PresenceIdentity>,
  ): PresenceSnapshot | { error: string } {
    if (typeof body?.userId !== 'string' || !body.userId) {
      return { error: 'userId is required' };
    }
    const appSource =
      typeof body.appSource === 'string' && body.appSource
        ? body.appSource
        : 'unknown';

    const previous = this.presence.get(client.id);
    if (previous && previous.userId !== body.userId) {
      void client.leave(previous.userId);
    }
    void client.join(body.userId);
    this.presence.set(client.id, { userId: body.userId, appSource });
    this.broadcastPresence();
    return this.getPresence();
  }

  @SubscribeMessage('presence:get')
  handlePresenceGet(): PresenceSnapshot {
    return this.getPresence();
  }

  /** Distinct online users, overall and per app. */
  getPresence(): PresenceSnapshot {
    const users = new Set<string>();
    const appUsers = new Map<string, Set<string>>();
    for (const { userId, appSource } of this.presence.values()) {
      users.add(userId);
      if (!appUsers.has(appSource)) appUsers.set(appSource, new Set());
      appUsers.get(appSource)!.add(userId);
    }
    const byApp: Record<string, number> = {};
    for (const [app, ids] of appUsers) byApp[app] = ids.size;
    return { onlineUsers: users.size, byApp };
  }

  private broadcastPresence() {
    this.server.emit('presence:update', this.getPresence());
  }

  @SubscribeMessage('ping')
  handlePing(): string {
    return 'pong';
  }

  /**
   * Broadcast a system-wide event
   */
  broadcastEvent(event: string, payload: any) {
    this.server.emit(event, payload);
    this.logger.log(`Broadcasted event: ${event}`);
  }

  /**
   * Send a targeted message to a specific user
   */
  sendToUser(userId: string, event: string, payload: any) {
    // Sockets join a room named after their userId in `identify`.
    this.server.to(userId).emit(event, payload);
  }
}
