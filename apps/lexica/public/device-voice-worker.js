/**
 * The on-device voice (issue #114): Kokoro-82M in a Web Worker, so loading and
 * making speech never freeze the page. Started by app/lib/audio/deviceVoice.ts.
 * Messages in:  { type: 'load', device, dtype }  { type: 'gen', id, text, voice, speed }
 * Messages out: { type: 'progress', progress } { type: 'loaded' } { type: 'audio', id, samples, rate, ms } { type: 'error', id?, message }
 */
let tts = null;

self.onmessage = async (e) => {
    const m = e.data;
    try {
        if (m.type === 'load') {
            const { KokoroTTS } = await import('https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm');
            tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
                dtype: m.dtype,
                device: m.device,
                progress_callback: (p) => {
                    if (p.status === 'progress' && p.progress) self.postMessage({ type: 'progress', progress: p.progress });
                },
            });
            self.postMessage({ type: 'loaded' });
        } else if (m.type === 'gen') {
            const t = performance.now();
            const a = await tts.generate(m.text, { voice: m.voice, speed: m.speed });
            const samples = a.audio;
            self.postMessage({ type: 'audio', id: m.id, samples, rate: a.sampling_rate, ms: Math.round(performance.now() - t) }, [samples.buffer]);
        }
    } catch (err) {
        self.postMessage({ type: 'error', id: m.id, message: String((err && err.message) || err) });
    }
};
