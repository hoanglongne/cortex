/** The name a player gave for the game boards, kept on this device. */
const KEY = 'lexica_nickname';

export function getSavedNickname(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
}
