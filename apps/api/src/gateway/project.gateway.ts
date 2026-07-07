import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

function projectRoom(projectId: number) {
  return `project:${projectId}`;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class ProjectGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // Step 1: verify identity when the socket first connects.
  async handleConnection(client: Socket) {
    const authToken = client.handshake.auth?.token;
    const cookieToken = parseCookies(client.handshake.headers.cookie ?? '')[
      'auth_token'
    ];
    const token = authToken ?? cookieToken;

    if (!token) {
      console.log(
        '[socket] no token found (auth or cookie), disconnecting',
        client.id,
      );
      return client.disconnect();
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub ?? payload.id;
      console.log('[socket] connected, userId:', client.data.userId);
    } catch (err) {
      console.log('[socket] token verify failed:', err);
      client.disconnect();
    }
  }

  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    console.log('[socket] join attempt', client.data.userId, data.projectId);
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_memberId: {
          projectId: data.projectId,
          memberId: client.data.userId,
        },
      },
    });
    if (!membership) {
      console.log('[socket] membership not found, refusing join');
      return;
    }
    client.join(projectRoom(data.projectId));
    console.log('[socket] joined room', projectRoom(data.projectId));
  }

  // Step 3: called from your services after a mutation succeeds.
  emitToProject(projectId: number, event: string, payload: unknown) {
    this.server.to(projectRoom(projectId)).emit(event, payload);
  }
}

function parseCookies(header: string): Record<string, string> {
  return header
    .split(';')
    .map((pair) => pair.trim().split('='))
    .reduce(
      (acc, [key, value]) => {
        if (key) acc[key] = decodeURIComponent(value ?? '');
        return acc;
      },
      {} as Record<string, string>,
    );
}
