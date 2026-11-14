import { describe, expect, it } from 'vitest';
import { allowedUrl, extractArticle, firstUrl } from '../../app/lib/dial/extract';

describe('dial article extraction', () => {
    it('allows only listed sites over http(s)', () => {
        expect(allowedUrl('https://vnexpress.net/a-1.html')).not.toBeNull();
        expect(allowedUrl('https://m.thanhnien.vn/x.htm')).not.toBeNull();
        expect(allowedUrl('https://evil.com/?u=vnexpress.net')).toBeNull();
        expect(allowedUrl('https://vnexpress.net.evil.com/')).toBeNull();
        expect(allowedUrl('file:///etc/passwd')).toBeNull();
        expect(allowedUrl('http://localhost:3000')).toBeNull();
        expect(allowedUrl('https://user:pw@vnexpress.net/')).toBeNull();
    });

    it('finds a link inside shared text', () => {
        expect(firstUrl('Đọc cái này https://tuoitre.vn/abc.htm nhé')).toBe('https://tuoitre.vn/abc.htm');
        expect(firstUrl('không có link')).toBeNull();
    });

    it('keeps Vietnamese paragraphs, decodes entities, drops duplicates', () => {
        const html = `<title>Ti&ecirc;u đề</title><script>var x="<p>không</p>"</script>
            <p>Đây là một đoạn văn đủ dài, có t&iacute;nh minh bạch và nhiều chữ tiếng Việt.</p>
            <p>Đây là một đoạn văn đủ dài, có t&iacute;nh minh bạch và nhiều chữ tiếng Việt.</p>
            <p>Short English paragraph without Vietnamese letters at all here.</p>`;
        const a = extractArticle(html);
        expect(a.title).toBe('Tiêu đề');
        expect(a.paragraphs).toEqual(['Đây là một đoạn văn đủ dài, có tính minh bạch và nhiều chữ tiếng Việt.']);
    });
});
