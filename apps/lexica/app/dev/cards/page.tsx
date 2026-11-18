'use client';

import WordCard from '../../components/WordCard';

const CARD = { word: 'abundant', ipa: 'əˈbʌndənt', meaning: 'dồi dào, nhiều', example: 'Cuối tháng lương về, đồ ăn abundant trong tủ lạnh.', scenario: 'lương về, mua đồ ăn' };

/** The word card in each edition, for checking the look (issue #146). */
export default function CardsDevPage() {
    return (
        <main className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-6 p-6">
            {(['common', 'silver', 'holo', 'legendary'] as const).map((e) => (
                <WordCard key={e} card={CARD} edition={e} serial={e === 'legendary' ? 7 : null} />
            ))}
        </main>
    );
}
