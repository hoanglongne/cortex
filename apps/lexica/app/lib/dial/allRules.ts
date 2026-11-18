/** Every Blend rule. A phrase with the same context belongs to the first card that claims it. */
import { dedupeRules, type DialRule } from './match';
import { DIAL_RULES_D0 } from './rules';
import { DIAL_RULES_MORE } from './rulesMore';

export const DIAL_RULES: DialRule[] = dedupeRules([...DIAL_RULES_D0, ...DIAL_RULES_MORE]);
