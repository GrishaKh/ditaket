export type LivePostKind = 'interim_summary' | 'flash';

export type LiveCounter = {
  id: string; // stable key: 'complaints' | 'resolved' | 'calls' | 'turnout' | …
  icon?: string; // emoji, e.g. '📄'
  value: number;
  labelAm: string;
  labelEn?: string;
  labelRu?: string;
  note?: string; // e.g. 'across 320 reporting stations'
};

export type SummaryContent = {
  badge?: string; // 'ՄԻՋԱՆԿՅԱԼ ԱՄՓՈՓՈՒՄ'
  title: string;
  intro?: string;
  highlight?: string;
  issues?: string[];
  cases?: { stations?: string; text: string }[];
  nextNote?: string;
  hashtags?: string[];
};

export type LivePostContent = {
  am?: SummaryContent;
  en?: SummaryContent;
  ru?: SummaryContent;
};
