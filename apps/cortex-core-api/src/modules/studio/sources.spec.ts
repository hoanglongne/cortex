import {
  decodeXml,
  parseGoogleTrends,
  parseRss,
  parseTraffic,
  parseYoutube,
} from './sources';

const GOOGLE_TRENDS = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:ht="https://trends.google.com/trending/rss" version="2.0"><channel>
<title>Daily Search Trends</title>
<item>
  <title>lịch nghỉ tết 2027</title>
  <ht:approx_traffic>200.000+</ht:approx_traffic>
  <link>https://trends.google.com/trending/rss?geo=VN</link>
  <pubDate>Sat, 10 Oct 2026 10:00:00 -0700</pubDate>
  <ht:news_item>
    <ht:news_item_title><![CDATA[Chính thức: Tết 2027 được nghỉ 9 ngày]]></ht:news_item_title>
    <ht:news_item_url>https://example.vn/tet-2027</ht:news_item_url>
  </ht:news_item>
</item>
<item>
  <title>giá vàng</title>
  <ht:approx_traffic>500+</ht:approx_traffic>
</item>
</channel></rss>`;

const RSS = `<rss version="2.0"><channel><title>VnExpress</title>
<item><title><![CDATA[Giới trẻ đổ xô săn deal 10.10 &amp; bị "vỡ" ví]]></title>
<description><![CDATA[<a href="x"><img src="y"></a></br>Nhiều bạn trẻ thừa nhận chi tiêu quá tay.]]></description>
<link>https://vnexpress.net/a.html</link></item>
<item><title>Tin thứ hai</title></item>
<item><description>không có tiêu đề</description></item>
</channel></rss>`;

describe('source parsers', () => {
  it('parses Google Trends daily RSS with traffic and headline', () => {
    const s = parseGoogleTrends(GOOGLE_TRENDS);
    expect(s).toHaveLength(2);
    expect(s[0]).toMatchObject({
      phrase: 'lịch nghỉ tết 2027',
      context: 'Chính thức: Tết 2027 được nghỉ 9 ngày',
      url: 'https://example.vn/tet-2027',
    });
    expect(s[0].metric).toBeGreaterThan(s[1].metric);
    expect(s[1].metric).toBeGreaterThanOrEqual(0.1);
  });

  it('parses generic RSS, decoding CDATA, entities and stripping HTML', () => {
    const s = parseRss(RSS);
    expect(s.map((x) => x.phrase)).toEqual([
      'Giới trẻ đổ xô săn deal 10.10 & bị "vỡ" ví',
      'Tin thứ hai',
    ]);
    expect(s[0].context).toBe('Nhiều bạn trẻ thừa nhận chi tiêu quá tay.');
    expect(s[0].url).toBe('https://vnexpress.net/a.html');
    expect(s[0].metric).toBeGreaterThan(s[1].metric);
  });

  it('parses YouTube mostPopular', () => {
    const s = parseYoutube({
      items: [
        {
          id: 'abc',
          snippet: { title: 'Vlog cuối tháng', channelTitle: 'Kênh A' },
          statistics: { viewCount: '1000000' },
        },
        { id: 'def', snippet: {} },
      ],
    });
    expect(s).toEqual([
      {
        phrase: 'Vlog cuối tháng',
        context: 'Kênh A',
        url: 'https://www.youtube.com/watch?v=abc',
        metric: expect.any(Number) as number,
      },
    ]);
    expect(parseYoutube(null)).toEqual([]);
  });

  it('handles traffic formats and entities', () => {
    expect(parseTraffic('20.000+')).toBe(20000);
    expect(parseTraffic('2,000+')).toBe(2000);
    expect(parseTraffic(undefined)).toBe(0);
    expect(decodeXml('a &#7841; &#x1EA1; &unknown;')).toBe('a ạ ạ &unknown;');
  });
});
