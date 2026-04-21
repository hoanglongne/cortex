import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
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
    // Note: In a real app, we'd maintain a map of userId -> socketId
    this.server.to(userId).emit(event, payload);
  }
}
