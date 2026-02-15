export type Poll = {
  id: string;
  slug: string;
  question: string;
  createdAt: string;
};

export type PollOption = {
  id: string;
  pollId: string;
  text: string;
  sortOrder: number;
};

export type Vote = {
  id: string;
  optionId: string;
  pollId: string;
  voterFingerprint: string;
  ipHash: string;
  createdAt: string;
};

export type PollWithOptionsAndVotes = Poll & {
  options: (PollOption & { voteCount: number })[];
  totalVotes: number;
};
