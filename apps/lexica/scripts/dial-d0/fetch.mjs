// Núm vặn D0: fetch recent Vietnamese news articles for the matcher trial.
// Usage: see the comment above the FEEDS choice below.
// Article text is copyrighted: keep the output out of the repo.
import fs from 'node:fs';

const FEEDS_DEV = [
    'https://thanhnien.vn/rss/home.rss',
    'https://thanhnien.vn/rss/kinh-te.rss',
    'https://thanhnien.vn/rss/doi-song.rss',
    'https://thanhnien.vn/rss/giao-duc.rss',
    'https://thanhnien.vn/rss/cong-nghe.rss',
    'https://thanhnien.vn/rss/suc-khoe.rss',
    'https://vnexpress.net/rss/kinh-doanh.rss',
    'https://vnexpress.net/rss/so-hoa.rss',
    'https://tuoitre.vn/rss/tin-moi-nhat.rss',
];
// A second set of feeds for the held-out test corpus.
const FEEDS_TEST = [
    'https://thanhnien.vn/rss/the-gioi.rss',
    'https://thanhnien.vn/rss/the-thao.rss',
    'https://thanhnien.vn/rss/van-hoa.rss',
    'https://thanhnien.vn/rss/du-lich.rss',
    'https://thanhnien.vn/rss/thoi-su.rss',
    'https://vnexpress.net/rss/thoi-su.rss',
    'https://vnexpress.net/rss/giao-duc.rss',
    'https://vnexpress.net/rss/suc-khoe.rss',
    'https://vnexpress.net/rss/du-lich.rss',
    'https://vnexpress.net/rss/the-gioi.rss',
    'https://vnexpress.net/rss/khoa-hoc.rss',
];
// Usage: fetch.mjs <outDir> <dev|test|NAME> [perFeed] [skip] [excludeCorpus...]
// Any set name other than dev uses the test feeds; skip drops the first items of each feed.
const [outDir, set = 'dev', perArg, skipArg, ...exclude] = process.argv.slice(2);
const per = Number(perArg ?? 4);
const skip = Number(skipArg ?? 0);
const excluded = new Set(exclude.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')).map((a) => a.url)));
const FEEDS = set === 'dev' ? FEEDS_DEV : FEEDS_TEST;
const seenParas = new Set();
fs.mkdirSync(outDir, { recursive: true });

const MARK = { acute: '\u0301', grave: '\u0300', tilde: '\u0303', circ: '\u0302', uml: '\u0308' };
const named = (_, name) => {
    const m = /^([a-zA-Z])(acute|grave|tilde|circ|uml)$/.exec(name);
    if (m) return (m[1] + MARK[m[2]]).normalize('NFC');
    return { nbsp: ' ', quot: '"', apos: "'", amp: '&', lt: '<', gt: '>', ndash: '–', mdash: '—', hellip: '…', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’' }[name] ?? `&${name};`;
};
const decode = (s) => s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);/g, named);

async function get(url) {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (research trial)' }, redirect: 'follow' });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return r.text();
}

function paragraphs(html) {
    const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
    return [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)]
        .map((m) => decode(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 60 && /[ăâđêôơư]/i.test(p));
}

const articles = [];
for (const feed of FEEDS) {
    let xml;
    try { xml = await get(feed); } catch (e) { console.error('skip feed', e.message); continue; }
    const links = [...xml.matchAll(/<item>[\s\S]*?<link>([\s\S]*?)<\/link>/g)].map((m) => decode(m[1]).trim()).slice(skip, skip + per);
    for (const url of links) {
        if (excluded.has(url) || articles.some((a) => a.url === url)) continue;
        try {
            // Drop paragraphs seen before (site boilerplate, syndicated copies).
            const paras = paragraphs(await get(url)).filter((p) => !seenParas.has(p) && seenParas.add(p));
            if (paras.length < 3) continue;
            articles.push({ url, text: paras.join('\n') });
            console.log('ok', paras.length, url);
        } catch (e) { console.error('skip', e.message); }
    }
}
fs.writeFileSync(`${outDir}/corpus-${set}.json`, JSON.stringify(articles, null, 1));
console.log(articles.length, 'articles');
