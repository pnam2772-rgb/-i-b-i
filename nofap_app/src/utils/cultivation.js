import { CULTIVATION_STAGES, NORMAL_STAGES } from '../constants/cultivationStages';

const resolveStagesByTheme = (theme) => (theme === 'normal' ? NORMAL_STAGES : CULTIVATION_STAGES);

export const getCurrentStage = (days, theme = 'xianxia') => {
  if (!days || days <= 0) return null;

  const sorted = [...resolveStagesByTheme(theme)].sort((a, b) => a.days - b.days);
  let current = null;

  for (const stage of sorted) {
    if (days >= stage.days) {
      current = stage;
    }
  }

  return current;
};

export const getNearestRewardDay = (days, theme = 'xianxia') => {
  const sorted = [...resolveStagesByTheme(theme)].sort((a, b) => a.days - b.days);
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (days >= sorted[i].days) return sorted[i].days;
  }
  return 0;
};

export const getStagesByTheme = (theme = 'xianxia') => resolveStagesByTheme(theme);
