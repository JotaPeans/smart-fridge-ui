export const TONES = ['mint', 'lavender', 'blush', 'sand', 'cream'] as const
export type Tone = (typeof TONES)[number]

export const toneClasses: Record<Tone, string> = {
  mint: 'bg-mint',
  lavender: 'bg-lavender',
  blush: 'bg-blush',
  sand: 'bg-sand',
  cream: 'bg-cream',
}

export function toneForId(id: string): Tone {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return TONES[hash % TONES.length]
}
