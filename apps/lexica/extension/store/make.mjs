// Makes the Chrome Web Store images for Lexica Blend (issue #141):
//   screenshot-1280x800.png: a demo article (no news brand) with words replaced,
//     styled by the extension's own content.css, and the meaning card open;
//   promo-440x280.png: the small promo tile.
// Usage (from apps/lexica): node extension/store/make.mjs
// Needs Playwright with a Chromium (the repo's e2e setup).
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = new URL('.', import.meta.url).pathname;
const css = fs.readFileSync(`${here}../src/content.css`, 'utf8');
const logo = fs.readFileSync(`${here}../../public/icon-192.png`).toString('base64');

const w = (en, due = false) => `<span class="lx-dial${due ? ' lx-due' : ''}">${en}</span>`;

const article = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>
${css}
body{margin:0;background:#FBF8F1;color:#1d1c19;font-family:Georgia,'Times New Roman',serif}
header{border-bottom:1px solid #e5e0d4;padding:18px 0;text-align:center;font:600 14px/1 system-ui,sans-serif;letter-spacing:.14em;color:#6f6a60}
main{width:720px;margin:0 auto;padding:40px 0}
h1{font:800 40px/1.15 system-ui,sans-serif;letter-spacing:-.02em;margin:0 0 10px}
.by{font:14px system-ui,sans-serif;color:#7a756a;margin-bottom:28px}
p{font-size:20px;line-height:1.75;margin:0 0 22px}
</style></head><body>
<header>GÓC ĐỌC · BÀI VIẾT MẪU</header>
<main>
<h1>Một năm làm việc từ xa: những điều tôi học được</h1>
<div class="by">Bài viết minh hoạ cho Lexica Blend</div>
<p>Khi công ty quyết định triển khai làm việc từ xa, nhiều người ${w('anxious')} rằng năng suất sẽ giảm. Thực tế cho thấy đây là phương án ${w('feasible', true)}, miễn là mỗi người chủ động sắp xếp thời gian và ${w('maintain')} liên lạc với đồng nghiệp.</p>
<p>Điều ${w('necessary')} nhất là một lịch làm việc rõ ràng. Tôi phải thừa nhận những tuần đầu khá ${w('struggle')}: ranh giới giữa việc và nhà rất mờ, và tôi khó giữ ${w('focus')}.</p>
<p>Sau vài tháng, tôi nhận ra ${w('benefit')} lớn nhất không nằm ở thời gian tiết kiệm được, mà ở chất lượng của những giờ làm việc ${w('focus')}. Những cuộc họp ${w('brief')}, minh bạch về mục tiêu giúp cả nhóm hợp tác ${w('effective')} hơn.</p>
</main>
<div class="lx-tip" style="left:600px;top:318px">
  <div><b>feasible</b><span class="ipa">/ˈfiː.zə.bəl/</span><button>🔊</button></div>
  <div class="vi">Trong bài: khả thi</div>
  <div class="hint">Khả thi, có thể thực hiện được</div>
  <div class="acts"><button>Đã thuộc</button><span class="sp"></span><span class="hint">Thay chỗ này</span><button class="on">👍</button><button>👎</button></div>
</div>
</body></html>`;

const promo = `<!doctype html><html><head><meta charset="utf-8"><style>
${css}
body{margin:0;width:440px;height:280px;background:#101012;color:#F4F2EA;font-family:system-ui,-apple-system,sans-serif;position:relative;overflow:hidden}
img{position:absolute;left:28px;top:30px;width:64px;height:64px;border-radius:16px}
h1{position:absolute;left:28px;top:112px;margin:0;font-size:30px;line-height:1.15;font-weight:800;letter-spacing:-.02em}
.sub{position:absolute;left:28px;bottom:26px;font:700 12px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase;color:#9C9AA3}
.card{position:absolute;right:-18px;top:30px;transform:rotate(6deg);background:#FF7BA0;color:#16150F;border:2px solid #000;box-shadow:4px 4px 0 #000;border-radius:18px;width:150px;height:96px;padding:12px;box-sizing:border-box;font-weight:800}
.card small{display:block;font:700 10px ui-monospace,monospace;letter-spacing:.08em;text-transform:uppercase}
.card span{display:block;margin-top:22px;font-size:24px}
</style></head><body>
<img src="data:image/png;base64,${logo}" alt="">
<div class="card"><small>Hẹn hò</small><span>crush</span></div>
<h1>Đọc web tiếng Việt,<br>gặp từ ${w('English')}</h1>
<div class="sub">Lexica Blend · tiện ích cho Chrome</div>
</body></html>`;

const browser = await chromium.launch();
for (const [name, html, width, height] of [
    ['screenshot-1280x800.png', article, 1280, 800],
    ['promo-440x280.png', promo, 440, 280],
]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.screenshot({ path: `${here}${name}` });
    await page.close();
}
await browser.close();
console.log('store images written');
