/**
 * The Gemini model the API uses unless GEMINI_MODEL says otherwise. Google
 * retires versions; override with GEMINI_MODEL without a deploy. Lives here,
 * not in a feature module, because Synapse, Lexica and Studio all use it.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
