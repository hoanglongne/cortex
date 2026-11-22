/**
 * The meaning card shown when a replaced word is tapped (Blend). One place for
 * what it says and how it looks, used by the Chrome extension (built into
 * content.js by extension/build.mjs, so this file has no imports and no
 * runtime dependencies), the store images, and the app's sheet.
 *
 * Direction B (docs/LEXICA_DESIGN_B.md): a hard dark card with a flat shadow,
 * a topic-coloured sticker, a word in heavy type, and short sections.
 */

export interface TipCard {
    /** The word as written on the card, lower case ("feasible"). */
    w: string;
    ipa?: string;
    /** Short Vietnamese meaning. */
    hint: string;
    /** Level label ("Cơ bản"). */
    lv: string;
    /** Topic label and its block colour. */
    tl: string;
    tc: string;
    /** Phrases the word goes with. */
    col: string[];
    /** A sentence with the word in it. */
    ex?: string;
    /** Word parts: [part, meaning] (prefix, root, suffix). */
    pt: [string, string][];
}

export const LEVEL_LABEL: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao', expert: 'Chuyên gia' };

interface CardLike {
    word: string;
    ipa?: string;
    translationHint: string;
    level: string;
    scenario?: string;
    collocations?: string[];
    surgeryModule?: Partial<Record<'prefix' | 'prefix2' | 'root' | 'root2' | 'suffix', { text: string; meaning: string } | undefined>>;
}

/** Only what the card shows, from a full content card. */
export function tipFacts(card: CardLike, topic: { label: string; color: string }): TipCard {
    const s = card.surgeryModule;
    const parts = s ? (['prefix', 'prefix2', 'root', 'root2', 'suffix'] as const).flatMap((k) => (s[k] ? [[s[k]!.text, s[k]!.meaning] as [string, string]] : [])) : [];
    return {
        w: card.word.toLowerCase(),
        ipa: card.ipa || undefined,
        hint: card.translationHint,
        lv: LEVEL_LABEL[card.level] ?? '',
        tl: topic.label,
        tc: topic.color,
        col: (card.collocations ?? []).slice(0, 3),
        ex: card.scenario || undefined,
        pt: parts.slice(0, 4),
    };
}

export function esc(s: string): string {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** The example sentence as HTML, with the word (and endings: benefit, benefits) marked. */
export function exampleHtml(ex: string, word: string): string {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[a-z]*`, 'gi');
    let out = '';
    let last = 0;
    for (const m of ex.matchAll(re)) {
        out += esc(ex.slice(last, m.index)) + `<mark>${esc(m[0])}</mark>`;
        last = (m.index ?? 0) + m[0].length;
    }
    return out + esc(ex.slice(last));
}

const SPEAKER = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';

/**
 * The card's HTML (inside a shadow root, with TIP_CSS). `en` is the word as
 * replaced on the page, `vi` the Vietnamese it replaced, `note` the line about
 * the review. Buttons: .say (word), .say-phrase (data-say), .known, .up, .down.
 */
export function tipHtml(a: { en: string; vi: string; card: Partial<TipCard>; note: string; actions?: boolean }): string {
    const c = a.card;
    const sec = (label: string, body: string) => `<section><h3>${label}</h3>${body}</section>`;
    return `<div class="top">${c.tl ? `<span class="tag topic" style="background:${esc(c.tc ?? '#B9BDC6')}">${esc(c.tl)}</span>` : ''}${c.lv ? `<span class="tag">${esc(c.lv)}</span>` : ''}</div>
<div class="word"><b>${esc(a.en)}</b><button class="say" title="Nghe phát âm" aria-label="Nghe phát âm">${SPEAKER}</button></div>
${c.ipa ? `<div class="ipa">/${esc(c.ipa)}/</div>` : ''}
<div class="mean"><span class="from">Trong bài: <i>${esc(a.vi)}</i></span>${c.hint ? `<p>${esc(c.hint)}</p>` : ''}</div>
${c.col?.length ? sec('Cụm hay gặp', `<div class="chips">${c.col.map((p) => `<button class="chip say-phrase" data-say="${esc(p)}" title="Nghe">${esc(p)}</button>`).join('')}</div>`) : ''}
${c.ex ? sec('Ví dụ', `<p class="ex">${exampleHtml(c.ex, c.w ?? a.en)}</p>`) : ''}
${c.pt?.length ? sec('Cấu tạo từ', `<div class="parts">${c.pt.map(([t, m]) => `<span class="part"><b>${esc(t)}</b>${esc(m)}</span>`).join('')}</div>`) : ''}
${a.note ? `<p class="note">${esc(a.note)}</p>` : ''}
${a.actions === false ? '' : `<div class="acts"><button class="known">Đã thuộc</button><span class="sp"></span><span class="lab">Thay chỗ này</span><button class="up" title="Thay hay" aria-label="Thay hay">👍</button><button class="down" title="Thay sai chỗ" aria-label="Thay sai chỗ">👎</button></div>`}`;
}

/** Style of the card, for the shadow root: the page's own CSS cannot touch it. */
export const TIP_CSS = `
:host{all:initial}
*{box-sizing:border-box}
.card{width:340px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow-y:auto;background:#1B1B1F;color:#F4F2EA;border:2px solid #000;border-radius:20px;padding:14px 16px 12px;font:14px/1.45 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;box-shadow:3px 3px 0 #000,0 0 0 1px rgba(255,255,255,.14);text-align:left}
.top{display:flex;gap:6px;flex-wrap:wrap}
.tag{display:inline-block;white-space:nowrap;font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#D4D2CA;border:1.5px solid #3A3A42;border-radius:999px;padding:2px 8px}
.tag.topic{color:#16150F;border-color:#000}
.word{display:flex;align-items:center;gap:8px;margin-top:10px}
.word b{font-size:28px;line-height:1.05;font-weight:800;letter-spacing:-.02em;text-transform:lowercase}
.say{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;border-radius:999px;border:2px solid #000;background:#C6F432;color:#16150F;cursor:pointer;flex:none}
.say:active{transform:translate(1px,1px)}
.ipa{margin-top:2px;color:#9C9AA3;font:13px ui-monospace,SFMono-Regular,Menlo,monospace}
.mean{margin-top:8px;padding-top:8px;border-top:1px solid #2C2C33}
.from{color:#9C9AA3;font-size:12px}
.from i{font-style:normal;color:#F4F2EA;font-weight:700}
.mean p{margin:2px 0 0;font-size:15px;font-weight:700;color:#F4F2EA}
section{margin-top:10px}
h3{margin:0 0 6px;font:700 10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:#9C9AA3;white-space:nowrap}
.chips,.parts{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1.5px solid #3A3A42;background:#222227;color:#F4F2EA;border-radius:999px;padding:2px 8px;font:600 12px system-ui,sans-serif;cursor:pointer;white-space:nowrap}
.chip:hover{border-color:#C6F432}
.ex{margin:0;color:#D4D2CA;font-size:12.5px;line-height:1.5}
mark{background:#C6F432;color:#16150F;border-radius:5px;padding:0 4px;font-weight:700;text-transform:lowercase}
.part{display:inline-flex;align-items:baseline;gap:6px;background:#222227;border-radius:10px;padding:4px 9px;color:#9C9AA3;font-size:12px;white-space:nowrap}
.part b{color:#F4F2EA;font:700 13px ui-monospace,SFMono-Regular,Menlo,monospace}
.note{margin:10px 0 0;color:#9C9AA3;font-size:12px}
.acts{display:flex;align-items:center;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #2C2C33;white-space:nowrap}
.acts .sp{flex:1}
.acts .lab{color:#9C9AA3;font-size:12px}
.acts button{font:700 13px system-ui,sans-serif;color:#F4F2EA;background:none;border:1.5px solid #3A3A42;border-radius:10px;padding:3px 9px;cursor:pointer}
.acts button.on{background:#F4F2EA;color:#101012;border-color:#F4F2EA}
button:focus-visible{outline:2px solid #C6F432;outline-offset:2px}
`;
