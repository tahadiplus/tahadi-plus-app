export const dailyChallenges = [
  {
    id: 'daily-quiz-1',
    title: 'تەحەدی ڕۆژانە',
    description: '٤ پرسیار وەڵام بدەوە و خەڵاتی ڕۆژانەت وەربگرە',
    reward: 250,
    target: 4,
    type: 'quiz',
  },
  {
    id: 'daily-win-1',
    title: 'یەک بردنەوە',
    description: 'لە PK ـدا یەک یاری ببەرەوە',
    reward: 500,
    target: 1,
    type: 'win',
  },
];

export const getDailyChallengeReward = (challenge) => challenge?.reward ?? 0;
