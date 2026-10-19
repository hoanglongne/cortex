/** One recorded answer of this user, kept on the device for the post-call summary. */
export interface LiveAnswer {
  questionId: string;
  part: number;
  questionText: string;
  blob: Blob;
  mimeType: string;
  durationMs: number;
}
