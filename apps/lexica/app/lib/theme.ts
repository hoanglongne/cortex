/**
 * Light / dark theme and branch accent (issue #146, round 3). The choice is
 * kept on this device; the html element carries data-theme and data-branch,
 * which app/globals.css turns into token values.
 */
export type ThemePref = 'dark' | 'light' | 'system';
export const THEME_KEY = 'lexica-theme';
export const THEME_LABEL: Record<ThemePref, string> = { dark: 'Tối', light: 'Sáng', system: 'Theo máy' };
export const THEME_PREFS: ThemePref[] = ['dark', 'light', 'system'];
/** Browser bar colour per theme (matches --color-bg). */
export const THEME_BAR: Record<'dark' | 'light', string> = { dark: '#0E0F11', light: '#F4F2EA' };

export function parseThemePref(raw: string | null): ThemePref {
    return raw === 'light' || raw === 'system' || raw === 'dark' ? raw : 'dark';
}

export function resolveTheme(pref: ThemePref, systemDark: boolean): 'dark' | 'light' {
    return pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;
}

/**
 * Runs before first paint (inlined in app/layout.tsx) so a light-theme user
 * never sees a dark flash: reads the saved choice and the learner's branch.
 */
export const THEME_BOOT = `(function(){try{var p=localStorage.getItem('${THEME_KEY}');var d=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;var t=p==='light'?'light':p==='system'?(d?'dark':'light'):'dark';var r=document.documentElement;r.setAttribute('data-theme',t);r.style.colorScheme=t;var s=JSON.parse(localStorage.getItem('lexica-storage')||'null');var b=s&&s.state&&s.state.path&&s.state.path.branch;if(b)r.setAttribute('data-branch',b);}catch(e){}})();`;
