import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Socket, Server } from 'socket.io';
  import { CoordinatesDto } from './dto/coordinates.dto';
  import { Events } from './enum/events.enum';
  
  @WebSocketGateway({ cors: { origin: '*' }, namespace: '/user/position' })
  export class WebsocketGateway
    implements OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
  
    handleConnection(client: Socket) {
      console.log('Cliente conectado ' + client.id);
    }
    handleDisconnect(client: Socket) {
      console.log('Cliente desconectado ' + client.id);
    }
  
    @SubscribeMessage(Events.position)
    handlePositionFromDelivery(client: Socket, data: CoordinatesDto) {
      console.log("se inserta la data", data);
      this.server.emit(`${Events.position}/${data.userId}`, { ...data });
    }
  }