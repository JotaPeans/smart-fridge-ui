export const TONES = ['mint', 'lavender', 'blush', 'sand', 'frost'] as const
export type Tone = (typeof TONES)[number]

export const toneClasses: Record<Tone, string> = {
  mint: 'bg-mint',
  lavender: 'bg-lavender',
  blush: 'bg-blush',
  sand: 'bg-sand',
  frost: 'bg-frost',
}

export function toneForId(id: string): Tone {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return TONES[hash % TONES.length]
}
