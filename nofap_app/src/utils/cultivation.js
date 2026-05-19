import { CULTIVATION_STAGES } from '../constants/cultivationStages';

export const getCurrentStage = (days) => {
  if (!days || days <= 0) return null;

  const sorted = [...CULTIVATION_STAGES].sort((a, b) => a.days - b.days);
  let current = null;

  for (const stage of sorted) {
    if (days >= stage.days) {
      current = stage;
    }
  }

  return current;
};

export const getNearestRewardDay = (days) => {
  const sorted = [...CULTIVATION_STAGES].sort((a, b) => a.days - b.days);
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (days >= sorted[i].days) return sorted[i].days;
  }
  return 0;
};
