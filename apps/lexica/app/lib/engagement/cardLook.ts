/**
 * How a word card looks (issue #146, đợt 2): a colour per topic, and the
 * tilt and light that follow the finger. Pure, unit tested.
 */
import type { TopicId } from './collection';

/** One muted hue per topic, used only for a small dot next to the topic name. */
export const TOPIC_COLOR: Record<TopicId, string> = {
    money: '#E0B341',
    work: '#5B8DEF',
    love: '#EF6F8E',
    study: '#9B7BEA',
    social: '#3FC1C9',
    food: '#F08A4B',
    people: '#7BC67E',
    life: '#A3A9B3',
};
