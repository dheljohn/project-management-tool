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
    const token = parseCookies(client.handshake.headers.cookie ?? '')[
      'auth_token'
    ];
    if (!token) return client.disconnect();

    try {
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub ?? payload.id;
    } catch {
      client.disconnect();
    }
  }

  // Step 2: verify membership before letting them into a project's room.
  @SubscribeMessage('joinProject')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: number },
  ) {
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_memberId: {
          projectId: data.projectId,
          memberId: client.data.userId,
        },
      },
    });

    if (!membership) return; // not a member, silently refuse the join

    client.join(projectRoom(data.projectId));
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
