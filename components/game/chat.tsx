"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  from: string;
  text: string;
  at: number;
}

export function Chat({
  messages,
  onSend,
}: {
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <section
      aria-labelledby="chat-title"
      className="flex min-h-64 flex-col rounded-xl border border-border bg-card p-3"
    >
      <h2 id="chat-title" className="mb-2 font-semibold">
        Chat
      </h2>
      <ol
        ref={list}
        role="log"
        aria-label="Chat messages"
        className="h-64 flex-1 space-y-1 overflow-y-auto text-sm"
      >
        {messages.map((m, i) => (
          <li key={`${m.at}-${i}`} className="break-words">
            <span className="font-semibold">{m.from}:</span> {m.text}
          </li>
        ))}
      </ol>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          onSend(t);
          setText("");
        }}
      >
        <input
          aria-label="Chat message"
          className="min-w-0 flex-1 rounded-md border border-border bg-transparent px-2 py-1"
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something…"
        />
        <Button type="submit" variant="outline">
          Send
        </Button>
      </form>
    </section>
  );
}
