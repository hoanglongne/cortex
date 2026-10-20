// Speed of each ONNX model in Chromium (onnxruntime-web, WASM), 1 and 4 threads, normal and 4x slower CPU.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox', '--enable-precise-memory-info'] });
const cases = [['whisper5_int8.onnx', 'mel5'], ['whisper10_int8.onnx', 'mel10'], ['whisper30_int8.onnx', 'mel30'], ['hubert_int8.onnx', 'audio3'], ['hubert_int8.onnx', 'audio6'], ['speako_int8.onnx', 'audio3']];
for (const cpu of [1, 4]) for (const threads of [1, 4]) for (const [file, kind] of cases) {
  const p = await b.newPage();
  const cdp = await p.context().newCDPSession(p);
  await p.goto('http://localhost:3200/');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const r = await p.evaluate(([f, k, t]) => window.bench(f, k, t), [file, kind, threads]).catch((e) => ({ file, kind, threads, error: String(e).slice(0, 120) }));
  console.log(JSON.stringify({ cpuSlowdown: cpu, ...r }));
  await p.close();
}
await b.close();
