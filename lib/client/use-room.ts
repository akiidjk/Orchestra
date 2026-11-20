"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ClientMsg,
  Profile,
  ServerMsg,
  Settings,
  Snapshot,
} from "@/lib/game/protocol";
import { loadToken, saveToken } from "./session";

type Chat = { from: string; text: string; at: number };

export function useRoom(
  code: string,
  profile: Profile | null,
  settings?: Settings,
) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat[]>([]);
  const [check, setCheck] = useState<{ word: string; valid: boolean } | null>(
    null,
  );
  const [status, setStatus] = useState<"connecting" | "open" | "closed">(
    "connecting",
  );
  const ws = useRef<WebSocket | null>(null);
  // Latest values without re-running the connection effect.
  const profileRef = useRef(profile);
  const settingsRef = useRef(settings);
  profileRef.current = profile;
  settingsRef.current = settings;
  const hasProfile = profile !== null;

  useEffect(() => {
    if (!hasProfile) return;
    let room = code; // becomes the real code once a "new" room is created
    let delay = 1000;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    function connect() {
      setStatus("connecting");
      const proto = location.protocol === "https:" ? "wss" : "ws";
      const sock = new WebSocket(`${proto}://${location.host}/ws`);
      ws.current = sock;

      sock.onopen = () => {
        delay = 1000;
        setStatus("open");
        const p = profileRef.current!;
        const s = settingsRef.current;
        sock.send(
          JSON.stringify(
            room === "new" && s
              ? { type: "create", profile: p, settings: s }
              : {
                  type: "join",
                  code: room,
                  profile: p,
                  token: loadToken(room),
                },
          ),
        );
      };

      sock.onmessage = (e) => {
        let msg: ServerMsg;
        try {
          msg = JSON.parse(e.data as string) as ServerMsg;
        } catch {
          return;
        }
        if (msg.type === "joined") {
          saveToken(msg.code, msg.token);
          setMe(msg.playerId);
          if (room === "new")
            window.history.replaceState(null, "", `/room/${msg.code}`);
          room = msg.code;
        } else if (msg.type === "state") setSnapshot(msg.snapshot);
        else if (msg.type === "check")
          setCheck({ word: msg.word, valid: msg.valid });
        else if (msg.type === "chat")
          setChat((c) =>
            [...c, { from: msg.from, text: msg.text, at: msg.at }].slice(-100),
          );
        else if (msg.type === "error") setError(msg.message);
      };

      sock.onclose = () => {
        if (ws.current === sock) ws.current = null;
        setStatus("closed");
        if (stopped) return;
        timer = setTimeout(connect, delay);
        delay = Math.min(delay * 2, 10000);
      };
    }

    connect();
    return () => {
      stopped = true;
      clearTimeout(timer);
      ws.current?.close();
      ws.current = null;
    };
  }, [code, hasProfile]);

  const send = useCallback((msg: ClientMsg) => {
    if (ws.current?.readyState === WebSocket.OPEN)
      ws.current.send(JSON.stringify(msg));
  }, []);
  const clearError = useCallback(() => setError(null), []);

  return { snapshot, me, error, chat, check, status, send, clearError };
}
