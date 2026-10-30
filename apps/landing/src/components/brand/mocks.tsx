/**
 * The products as they look, redrawn in HTML so they stay sharp at any size.
 * Names and numbers are made up for the picture; the layouts follow the apps.
 */

/** Lexica: a card from the day's session. */
export function FlashCard() {
  return (
    <div className="w-[260px] rounded-3xl border border-white/10 bg-[#0E0F11] p-5 text-[#EDEEF0] shadow-[6px_8px_0_0_rgba(31,29,26,0.18)]">
      <div className="flex items-center justify-between text-[11px] text-white/45">
        <span>Hôm nay · Ôn</span>
        <span>4/12</span>
      </div>
      <div className="mt-2 h-1 rounded-full bg-white/10">
        <div className="h-1 w-1/3 rounded-full bg-[#C6F432]" />
      </div>
      <p className="mt-8 text-3xl font-bold tracking-tight">ABUNDANT</p>
      <p className="mt-1 font-mono text-xs text-white/45">/əˈbʌndənt/</p>
      <p className="mt-6 text-sm leading-relaxed text-white/80">Năm nay mùa xoài rất <span className="rounded bg-[#C6F432]/20 px-1 font-semibold text-[#C6F432]">abundant</span>, cả xóm ai cũng có xoài ăn.</p>
      <div className="mt-8 grid grid-cols-2 gap-2 text-sm font-semibold">
        <span className="rounded-xl border border-white/15 py-2.5 text-center text-white/80">Quên rồi</span>
        <span className="rounded-xl bg-[#C6F432] py-2.5 text-center text-[#0E0F11]">Nhớ</span>
      </div>
    </div>
  );
}

/** Teach: the morning list. */
export function TodayList() {
  const rows: [string, string, string][] = [
    ["An", "chưa ôn 4 ngày", "Nhắn"],
    ["Bình", "sai nhiều từ “dilemma”", "Giao bài ôn"],
    ["Chi", "nghỉ 2 buổi liền", "Gọi hỏi"],
  ];
  return (
    <div className="w-[300px] rounded-2xl border border-[#E4DBCB] bg-[#FBF7F0] p-5 font-body text-[#1F1D1A]">
      <p className="font-serif text-lg font-semibold">Hôm nay</p>
      <p className="text-xs text-[#7A7468]">Lớp IELTS 6.0, tối thứ ba · 14 học viên</p>
      <ul className="mt-4 space-y-2.5">
        {rows.map(([n, why, act]) => (
          <li key={n} className="flex items-center justify-between gap-2 border-t border-[#E4DBCB] pt-2.5 text-sm">
            <span>
              <span className="font-semibold">{n}</span> <span className="text-[#4A463F]">{why}</span>
            </span>
            <span className="shrink-0 rounded-lg bg-[#2E7556] px-2.5 py-1 text-xs font-semibold text-white">{act}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The weekly slip for a parent. */
export function ParentSlip() {
  return (
    <div className="w-[270px] rounded-sm bg-white p-5 font-body text-[#1F1D1A]">
      <p className="font-serif text-lg font-semibold">Báo cáo tuần của Minh</p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between border-b border-dashed border-[#DDD3C2] pb-1.5">
          <dt className="text-[#4A463F]">Ngày có học</dt>
          <dd className="font-semibold">5/7</dd>
        </div>
        <div className="flex justify-between border-b border-dashed border-[#DDD3C2] pb-1.5">
          <dt className="text-[#4A463F]">Từ nhớ thêm</dt>
          <dd className="font-semibold">38</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[#4A463F]">Nên để ý</dt>
          <dd className="font-semibold">âm cuối của từ</dd>
        </div>
      </dl>
    </div>
  );
}
