"use client";

import type { Profile } from "@/lib/game/protocol";
import { AvatarEditor } from "./avatar";

export function ProfileForm({
  value,
  onChange,
}: {
  value: Profile;
  onChange: (p: Profile) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 font-semibold">
        Nickname
        <input
          className="rounded-xl border border-border bg-card px-3 py-2 font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand"
          value={value.nickname}
          maxLength={20}
          required
          autoComplete="nickname"
          onChange={(e) => onChange({ ...value, nickname: e.target.value })}
        />
      </label>
      <AvatarEditor
        value={value.avatar}
        onChange={(avatar) => onChange({ ...value, avatar })}
      />
    </div>
  );
}
