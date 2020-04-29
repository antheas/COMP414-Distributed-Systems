import axios from "axios";
import io from "socket.io-client";
import { buffers, eventChannel } from "redux-saga";
import { Play, TournamentPlay } from "../../../types";
import { ConnectionError } from "../errors";
import { PLAY_LIST } from "../fake/fake";
import { sleep } from "../utils";
import {
  CONNECTION_ERROR,
  DATA,
  DataEvent,
  DISCONNECTED,
  EMIT_MAKE_MOVE,
  EMIT_MESSAGE,
  EXIT,
  FORFEIT,
  ID_COOKIE,
  MakeMoveEvent,
  MESSAGE,
  MessageEvent,
  READY,
  RECEIVE_DATA,
  RECEIVE_MESSAGE,
  RECEIVE_UPDATED_STATE,
  TIMED_OUT,
  TOKEN_COOKIE,
  UpdatedStateEvent,
  UPDATED_STATE,
  RECEIVE_CONNECTION_ERROR,
  RECEIVE_READY,
} from "./receiverContract";
import { ConnectionErrorEvent } from "./contract";

export async function retrievePlay(
  token: string,
  id: string
): Promise<{ play: Play | TournamentPlay; url: string }> {
  // TODO: Implement this call
  await sleep(200);
  return {
    play: PLAY_LIST.map((p) => ({
      ...p,
      isPlayer1: p.opponent !== token,
    })).find((p) => p.id) as Play,
    url: process.env.GAME_URL as string,
  };
}

export async function checkPlay(
  token: string,
  url: string,
  id: string
): Promise<boolean> {
  try {
    const req = await axios.get(`${url}/check`, { params: { id, token } });
    return req.status === 200 && req.data.valid;
  } catch (error) {
    console.log(error);
    if (!error.response) {
      throw new ConnectionError("Server did not respond");
    } else {
      return false;
    }
  }
}

export async function setupSocket(token: string, url: string, id: string) {
  const socket = io.connect({
    path: `${url}/socket.io`,
    transportOptions: {
      polling: {
        extraHeaders: {
          [TOKEN_COOKIE]: token,
          [ID_COOKIE]: id,
        },
      },
    },
  });
  console.log("created socket");
  try {
    await new Promise((resolve, reject) => {
      socket.on("connect_error", () => {
        socket.off("connect_error");
        socket.off("connect");
        socket.disconnect();
        console.log("connection error");
        reject();
      });
      socket.on("connect", () => {
        socket.off("connect_error");
        socket.off("connect");
        resolve();
      });
    });
  } catch (e) {
    return undefined;
  }

  return socket;
}

export function setupSocketChannel(socket: SocketIOClient.Socket) {
  return eventChannel((emitter) => {
    socket.on("connect_timeout", () => emitter({ type: TIMED_OUT }));
    socket.on("connect_error", () => emitter({ type: CONNECTION_ERROR }));
    socket.on("disconnect", () => emitter({ type: DISCONNECTED }));

    socket.on(MESSAGE, (event: MessageEvent) => {
      console.log(event);
      emitter({ type: RECEIVE_MESSAGE, event });
    });
    socket.on(DATA, (event: DataEvent) => {
      console.log(event);
      emitter({ type: RECEIVE_DATA, event });
    });
    socket.on(UPDATED_STATE, (event: UpdatedStateEvent) => {
      console.log(event);
      emitter({ type: RECEIVE_UPDATED_STATE, event });
    });
    socket.on(CONNECTION_ERROR, (event: ConnectionErrorEvent) => {
      console.log(event);
      emitter({ type: RECEIVE_CONNECTION_ERROR, event });
    });
    socket.on(READY, () => {
      console.log("ready");
      emitter({ type: RECEIVE_READY });
    });

    socket.emit(READY);
    console.log("emitted ready...");

    return () => {
      socket.disconnect();
    };
  }, buffers.expanding());
}

export async function emitForfeit(socket: SocketIOClient.Socket) {
  socket.emit(FORFEIT);
}

export async function emitExit(socket: SocketIOClient.Socket) {
  socket.emit(EXIT);
}

export async function emitMessage(
  socket: SocketIOClient.Socket,
  message: string
) {
  socket.emit(EMIT_MESSAGE, { message } as MessageEvent);
}

export async function emitMove(
  socket: SocketIOClient.Socket,
  data: string,
  move: string
) {
  console.log(data);
  socket.emit(EMIT_MAKE_MOVE, { data, move } as MakeMoveEvent);
}
