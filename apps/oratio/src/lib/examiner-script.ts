/**
 * What the examiner says, and how long each part should take (docs §5.3).
 * Lines are paraphrased from how the real test runs, not copied from any official script.
 */

export interface ExaminerMoment {
  id: "p1-open" | "p1-next" | "p2-brief" | "p2-after" | "p3-open" | "p3-next" | "closing";
  /** Vietnamese: when to say it */
  when: string;
  /** English: what to say */
  line: string;
}

const MOMENTS: Record<ExaminerMoment["id"], ExaminerMoment> = {
  "p1-open": {
    id: "p1-open",
    when: "Mở đầu Part 1",
    line: "Good evening. My name is the examiner today. Could you tell me your full name, please? And what shall I call you? Thank you. Now, in this first part I'd like to ask you some questions about yourself.",
  },
  "p1-next": {
    id: "p1-next",
    when: "Bạn kia vào thi Part 1",
    line: "Thank you. Now it is your turn. Could you tell me your full name, please? Good. Let's begin with some questions about you.",
  },
  "p2-brief": {
    id: "p2-brief",
    when: "Trước khi đưa thẻ đề Part 2",
    line: "Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. Before you speak, you have one minute to think about what you want to say, and you can make notes if you like. Do you understand? Here is your topic.",
  },
  "p2-after": {
    id: "p2-after",
    when: "Khi thí sinh nói xong Part 2",
    line: "Thank you, that's the end of your talk. I'd just like to ask you one more question about it.",
  },
  "p3-open": {
    id: "p3-open",
    when: "Chuyển sang Part 3",
    line: "Thank you. We've been talking about your own experience; now I'd like to discuss some more general questions related to it.",
  },
  "p3-next": {
    id: "p3-next",
    when: "Bạn kia vào thi Part 3",
    line: "Thank you. Now let's move on to some wider questions linked to the topic.",
  },
  closing: {
    id: "closing",
    when: "Kết thúc buổi thi",
    line: "Thank you very much. That is the end of the speaking test.",
  },
};

export interface ExaminerPosition {
  part: number;
  /** 1-based position inside the current candidate's turn */
  questionInTurn: number;
  turnInPart: 1 | 2;
  /** false until the first question of the call is picked */
  hasQuestion: boolean;
  /** All questions have been asked */
  completed: boolean;
}

/** The line for this moment, or null when the examiner just reads the next question. */
export function examinerMoment(p: ExaminerPosition): ExaminerMoment | null {
  if (p.completed) return MOMENTS.closing;
  if (!p.hasQuestion) return MOMENTS["p1-open"];
  const first = p.questionInTurn === 1;
  if (p.part === 1) return first ? (p.turnInPart === 1 ? MOMENTS["p1-open"] : MOMENTS["p1-next"]) : null;
  if (p.part === 2) return first ? MOMENTS["p2-brief"] : MOMENTS["p2-after"];
  return first ? (p.turnInPart === 1 ? MOMENTS["p3-open"] : MOMENTS["p3-next"]) : null;
}

export interface PartTarget {
  /** Target length of one candidate's turn, in seconds */
  minS: number;
  maxS: number;
  /** Part 2 only */
  prepS?: number;
  label: string;
}

export const PART_TARGETS: Record<1 | 2 | 3, PartTarget> = {
  1: { minS: 240, maxS: 300, label: "4–5 phút" },
  2: { minS: 180, maxS: 180, prepS: 60, label: "1 phút chuẩn bị + 2 phút nói" },
  3: { minS: 240, maxS: 300, label: "4–5 phút" },
};

export function partTarget(part: number): PartTarget {
  return PART_TARGETS[part === 2 ? 2 : part === 3 ? 3 : 1];
}

export type Pace = "under" | "on" | "over";

/** Where the turn stands against its target: still short, inside the window, or past it. */
export function paceStatus(part: number, elapsedS: number): Pace {
  const t = partTarget(part);
  if (elapsedS < t.minS) return "under";
  return elapsedS <= t.maxS ? "on" : "over";
}
