// Gera uma cor consistente e visualmente agradável a partir de uma string.
const PALETTE = [
  '#7c3aed', // violet
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // red
  '#7c3aed', // violet (repeat with offset)
  '#0891b2', // cyan
  '#9333ea', // purple
  '#16a34a', // green
  '#ea580c', // orange
  '#2dd4bf', // teal
  '#f472b6', // pink
  '#a3e635', // lime
  '#60a5fa', // light blue
  '#fbbf24', // yellow
  '#f87171', // light red
];

export function corParaCodigo(codigo: string): string {
  let hash = 0;
  for (let i = 0; i < codigo.length; i++) {
    hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/** Retorna uma versão mais clara da cor (para background) */
export function corFundo(hex: string, opacity = 0.18): string {
  return hex + Math.round(opacity * 255).toString(16).padStart(2, '0');
}
