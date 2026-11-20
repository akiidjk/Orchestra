"use client";

import type { ReactNode } from "react";
import { AVATAR_PARTS, type Avatar as AvatarData } from "@/lib/game/protocol";

const SKIN = ["#fde0c5", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#5c3a1e"];
const HAIR = ["#2b1d14", "#6b3e26", "#c9783a", "#f2d16b", "#c7c9d1", "#e85d75"];
const INK = "#1e1b4b";

const EYES: ReactNode[] = [
  <g key="dots" fill={INK}>
    <circle cx="38" cy="50" r="4" />
    <circle cx="62" cy="50" r="4" />
  </g>,
  <g key="big">
    <circle cx="38" cy="50" r="7" fill="#fff" />
    <circle cx="62" cy="50" r="7" fill="#fff" />
    <circle cx="39" cy="51" r="3.5" fill={INK} />
    <circle cx="63" cy="51" r="3.5" fill={INK} />
  </g>,
  <path
    key="happy"
    d="M32 52q6-7 12 0M56 52q6-7 12 0"
    stroke={INK}
    strokeWidth="3"
    fill="none"
    strokeLinecap="round"
  />,
  <path
    key="sleepy"
    d="M32 49q6 5 12 0M56 49q6 5 12 0"
    stroke={INK}
    strokeWidth="3"
    fill="none"
    strokeLinecap="round"
  />,
  <g key="wink">
    <circle cx="38" cy="50" r="4" fill={INK} />
    <path
      d="M56 52q6-7 12 0"
      stroke={INK}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </g>,
];

const MOUTH: ReactNode[] = [
  <path key="smile" d="M40 65q10 10 20 0" />,
  <path key="grin" d="M38 64q12 16 24 0z" fill={INK} />,
  <path key="flat" d="M42 68h16" />,
  <ellipse key="o" cx="50" cy="68" rx="5" ry="6" fill={INK} />,
  <path key="smirk" d="M41 68q10 4 18-5" />,
];

// Hair is drawn in two layers: behind the face and over it.
const HAIR_BACK: (ReactNode | null)[] = [
  null,
  null,
  null,
  <rect key="long" x="14" y="26" width="72" height="66" rx="22" />,
  <circle key="afro" cx="50" cy="42" r="40" />,
  null,
];
const FRINGE = "M18 52Q16 18 50 18Q84 18 82 52Q76 32 50 31Q24 32 18 52Z";
const HAIR_FRONT: (ReactNode | null)[] = [
  null,
  <path key="short" d={FRINGE} />,
  <path
    key="spiky"
    d="M19 50L22 22L33 29L41 12L52 25L62 10L69 27L80 21L81 50Q72 31 50 30Q28 31 19 50Z"
  />,
  <path key="long" d={FRINGE} />,
  <g key="afro">
    <circle cx="30" cy="28" r="11" />
    <circle cx="43" cy="22" r="11" />
    <circle cx="57" cy="22" r="11" />
    <circle cx="70" cy="28" r="11" />
  </g>,
  <g key="bun">
    <circle cx="50" cy="12" r="10" />
    <path d={FRINGE} />
  </g>,
];

const ACCESSORY: (ReactNode | null)[] = [
  null,
  <g key="glasses" stroke={INK} strokeWidth="2.5" fill="none">
    <circle cx="38" cy="50" r="9" />
    <circle cx="62" cy="50" r="9" />
    <path d="M47 50h6" />
  </g>,
  <g key="sunglasses" fill="#111827">
    <rect x="27" y="44" width="20" height="12" rx="5" />
    <rect x="53" y="44" width="20" height="12" rx="5" />
    <path d="M47 48h6" stroke="#111827" strokeWidth="2.5" />
  </g>,
  <g key="headphones">
    <path
      d="M15 54Q15 8 50 8Q85 8 85 54"
      stroke="#3730a3"
      strokeWidth="6"
      fill="none"
    />
    <rect x="9" y="44" width="11" height="20" rx="4" fill="#f59e0b" />
    <rect x="80" y="44" width="11" height="20" rx="4" fill="#f59e0b" />
  </g>,
  <g key="party">
    <path d="M37 25L50 1L63 25Z" fill="#f59e0b" />
    <path d="M42 16h16" stroke="#3730a3" strokeWidth="3" />
    <circle cx="50" cy="3" r="4" fill="#e85d75" />
  </g>,
];

export function Avatar({
  avatar,
  size = 48,
  title,
}: {
  avatar: AvatarData;
  size?: number;
  title?: string;
}) {
  const skin = SKIN[avatar.skin] ?? SKIN[0];
  const hair = HAIR[avatar.hairColor] ?? HAIR[0];
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={title ?? "avatar"}
    >
      <g fill={hair}>{HAIR_BACK[avatar.hair]}</g>
      <circle cx="18" cy="56" r="7" fill={skin} />
      <circle cx="82" cy="56" r="7" fill={skin} />
      <circle cx="50" cy="54" r="32" fill={skin} />
      <circle cx="31" cy="63" r="4.5" fill="#f87171" opacity="0.3" />
      <circle cx="69" cy="63" r="4.5" fill="#f87171" opacity="0.3" />
      {EYES[avatar.eyes]}
      <g
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {MOUTH[avatar.mouth]}
      </g>
      <g fill={hair}>{HAIR_FRONT[avatar.hair]}</g>
      {ACCESSORY[avatar.accessory]}
    </svg>
  );
}

export function randomAvatar(): AvatarData {
  const a = {} as AvatarData;
  for (const [k, n] of Object.entries(AVATAR_PARTS))
    a[k as keyof AvatarData] = Math.floor(Math.random() * n);
  return a;
}

const LABELS: Record<keyof AvatarData, string> = {
  skin: "skin",
  eyes: "eyes",
  mouth: "mouth",
  hair: "hair",
  hairColor: "hair color",
  accessory: "accessory",
};

const stepBtn =
  "h-9 w-9 rounded-full border border-border bg-card text-xl leading-none hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand";

export function AvatarEditor({
  value,
  onChange,
}: {
  value: AvatarData;
  onChange: (a: AvatarData) => void;
}) {
  const parts = Object.keys(AVATAR_PARTS) as (keyof AvatarData)[];
  const step = (part: keyof AvatarData, d: number) => {
    const n = AVATAR_PARTS[part];
    onChange({ ...value, [part]: (value[part] + d + n) % n });
  };
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-3">
        <Avatar avatar={value} size={140} title="Your avatar" />
        <button
          type="button"
          className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-semibold hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand"
          onClick={() => onChange(randomAvatar())}
        >
          🎲 Randomize
        </button>
      </div>
      <ul className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
        {parts.map((part) => (
          <li key={part} className="flex items-center justify-between gap-2">
            <button
              type="button"
              className={stepBtn}
              aria-label={`Previous ${LABELS[part]}`}
              onClick={() => step(part, -1)}
            >
              ‹
            </button>
            <span className="flex-1 text-center text-sm capitalize">
              {LABELS[part]}{" "}
              <span className="text-muted">
                {value[part] + 1}/{AVATAR_PARTS[part]}
              </span>
            </span>
            <button
              type="button"
              className={stepBtn}
              aria-label={`Next ${LABELS[part]}`}
              onClick={() => step(part, 1)}
            >
              ›
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
