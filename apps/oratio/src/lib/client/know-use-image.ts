/**
 * Shareable image for Biết – Dùng (issue #137): numbers only, never speech.
 * Drawn on a canvas in the browser; returns a PNG.
 */
export async function knowUseImage(learned: number, used: number): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const size = 1080;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return null;
  const font = (w: number, px: number) => `${w} ${px}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  g.fillStyle = "#121212";
  g.fillRect(0, 0, size, size);
  g.fillStyle = "#FF5A1F";
  g.fillRect(80, 80, 120, 12);
  g.fillStyle = "#F5F5F0";
  g.font = font(800, 150);
  g.fillText(`Biết ${learned}`, 80, 380);
  g.fillStyle = "#FF5A1F";
  g.fillText(`Dùng ${used}`, 80, 560);
  // Bar
  const rate = learned ? Math.min(1, used / learned) : 0;
  g.fillStyle = "#2A2A2A";
  g.fillRect(80, 650, size - 160, 36);
  g.fillStyle = "#FF5A1F";
  g.fillRect(80, 650, Math.max(12, (size - 160) * rate), 36);
  g.fillStyle = "#B8B8B0";
  g.font = font(500, 42);
  g.fillText(`Dùng được ${Math.round(rate * 100)}% số từ đã học khi nói`, 80, 760);
  g.font = font(700, 40);
  g.fillStyle = "#F5F5F0";
  g.fillText("Oratio × Lexica", 80, size - 100);
  return new Promise((resolve) => c.toBlob((b) => resolve(b), "image/png"));
}
