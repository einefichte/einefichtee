
import { DurableObject } from "cloudflare:workers";

type Player = {
  id: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
};

type PlayerMessage = {
  type: "move";
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
};

type BlockMessage = {
  type: "block";
  x: number;
  y: number;
  z: number;
  block: string;
};

type ClientMessage = PlayerMessage | BlockMessage;

const MAX_PLAYERS = 5;

const ALLOWED_BLOCKS = [
  "air",
  "grass",
  "dirt",
  "stone",
  "wood",
  "water"
];

function getPlayer(ws: WebSocket): Player | null {
  return ws.deserializeAttachment() as Player | null;
}

function send(ws: WebSocket, data: unknown) {
  try {
    ws.send(JSON.stringify(data));
  } catch {
    // Verbindung ist möglicherweise bereits geschlossen.
  }
}

export class MyDurableObject extends DurableObject<Env> {

  async fetch(request: Request): Promise<Response> {
    const upgrade = request.headers.get("Upgrade");

    if (upgrade?.toLowerCase() !== "websocket") {
      return new Response("WebSocket connection required", {
        status: 426
      });
    }

    const sockets = this.ctx.getWebSockets();

    if (sockets.length >= MAX_PLAYERS) {
      return new Response("Room is full (maximum 5 players)", {
        status: 503
      });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const player: Player = {
      id: crypto.randomUUID(),
      x: 0,
      y: 4,
      z: 0,
      yaw: 0,
      pitch: 0
    };

    server.serializeAttachment(player);

    this.ctx.acceptWebSocket(server);

    const players = this.ctx.getWebSockets()
      .filter(ws => ws !== server)
      .map(ws => getPlayer(ws))
      .filter((p): p is Player => p !== null);

    send(server, {
      type: "welcome",
      playerId: player.id,
      players
    });

    this.broadcast({
      type: "player-joined",
      player
    }, server);

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer
  ) {
    const player = getPlayer(ws);

    if (!player) return;

    let data: ClientMessage;

    try {
      const raw = typeof message === "string"
        ? message
        : new TextDecoder().decode(message);

      if (raw.length > 2048) return;

      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (data.type === "move") {
      const values = [
        data.x,
        data.y,
        data.z,
        data.yaw,
        data.pitch
      ];

      if (!values.every(Number.isFinite)) return;

      // Verhindert absurde Positionswerte.
      if (
        Math.abs(data.x) > 10000 ||
        Math.abs(data.y) > 10000 ||
        Math.abs(data.z) > 10000
      ) return;

      const updatedPlayer: Player = {
        ...player,
        x: data.x,
        y: data.y,
        z: data.z,
        yaw: data.yaw,
        pitch: data.pitch
      };

      ws.serializeAttachment(updatedPlayer);

      this.broadcast({
        type: "player-moved",
        player: updatedPlayer
      }, ws);

      return;
    }

    if (data.type === "block") {
      if (
        !Number.isInteger(data.x) ||
        !Number.isInteger(data.y) ||
        !Number.isInteger(data.z) ||
        Math.abs(data.x) > 1000 ||
        Math.abs(data.y) > 1000 ||
        Math.abs(data.z) > 1000 ||
        !ALLOWED_BLOCKS.includes(data.block)
      ) return;

      this.broadcast({
        type: "block-changed",
        playerId: player.id,
        x: data.x,
        y: data.y,
        z: data.z,
        block: data.block
      });
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ) {
    const player = getPlayer(ws);

    if (code >= 1000 && code < 5000 &&
        ![1004, 1005, 1006, 1015].includes(code)) {
      ws.close(code, reason);
    } else {
      ws.close();
    }

    if (player) {
      this.broadcast({
        type: "player-left",
        playerId: player.id
      }, ws);
    }
  }

  async webSocketError(ws: WebSocket) {
    const player = getPlayer(ws);

    if (player) {
      this.broadcast({
        type: "player-left",
        playerId: player.id
      }, ws);
    }
  }

  private broadcast(data: unknown, except?: WebSocket) {
    for (const ws of this.ctx.getWebSockets()) {
      if (ws !== except) {
        send(ws, data);
      }
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return Response.json({
        name: "Einefichte Minecraft Server",
        status: "online",
        maxPlayers: MAX_PLAYERS,
        endpoint: "/room/NAME"
      });
    }

    const match = url.pathname.match(/^\/room\/([a-zA-Z0-9_-]{1,40})$/);

    if (!match) {
      return new Response("Unknown endpoint", {
        status: 404
      });
    }

    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket connection required", {
        status: 426
      });
    }

    const roomName = match[1];
    const room = env.MY_DURABLE_OBJECT.getByName(roomName);

    return room.fetch(request);
  }
} satisfies ExportedHandler<Env>;
