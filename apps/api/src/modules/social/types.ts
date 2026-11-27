export type Platform = "facebook" | "instagram";
export type PostStatus = "preview" | "posted" | "failed" | "held";

/** One lesson that could be posted. `id` is the lesson file name without .json (unique). */
export interface Candidate {
  id: string;
  source: "lesson" | "gk";
  board: string; // lower case, as in the lesson address
  cls: number;
  subject: string;
  chapter: string;
  topic: string;
  title: string;
  /** plain sentences taken from the lesson's own explanation, in order */
  sentences: string[];
  /** the teacher's narration lines (and which teacher voice speaks them), used to find the lesson's recorded voice-over */
  narration: { teacher: string; text: string }[];
  /** short key points (lesson summary block, else the first sentences) */
  points: string[];
  /** the classroom board (picture/animation) exists for this lesson */
  hasBoard: boolean;
  boardFile?: string;
  /** site path of the lesson page */
  path: string;
}

export interface LedgerEntry {
  /** unique id of this record */
  rid: string;
  lessonId: string;
  platform: Platform;
  status: PostStatus;
  board: string;
  cls: number;
  subject: string;
  title: string;
  createdAt: string;
  postedAt?: string;
  remoteId?: string;
  /** Set before handing off publication. An uncertain result stays reserved across retries and restarts. */
  deliveryPending?: boolean;
  deliveryStartedAt?: string;
  remoteUrl?: string;
  caption: string;
  alt: string;
  /** media file names inside data/social/media (random names) */
  image?: string;
  video?: string;
  needsAudio?: boolean;
  hold?: string;
  error?: string;
  attempts: number;
  run?: string;
}

export interface RunRecord { id: string; at: string; mode: "preview" | "live"; slot?: string; planned: number; posted: number; failed: number; held: number; note?: string }
export interface SocialState {
  /** rotation memory: when each "board|cls|subject" bucket was last used (a counter, higher = more recent) */
  bucketUsed: Record<string, number>;
  counter: number;
  /** last posts, newest last, for the "no same class/subject in a row" rule */
  recent: { cls: number; subject: string; board: string }[];
  /** slots already run, "YYYY-MM-DD@HH:MM" (India date) */
  slotsDone: string[];
  consecutiveFailures: number;
  pausedReason?: string;
}
export interface SocialSecrets { fbPageId?: string; fbPageToken?: string; igUserId?: string; igToken?: string; appId?: string; appSecret?: string }
export type SettingsMap = Record<string, unknown>;
