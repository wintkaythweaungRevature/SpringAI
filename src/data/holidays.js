/**
 * Holiday & awareness dates for Content Calendar overlay.
 * Format: "MM-DD" keys (year-agnostic) for recurring holidays.
 * type: 'holiday' | 'awareness' | 'shopping'
 */
export const HOLIDAYS = [
  // ── January ────────────────────────────────────────────────────────────────
  { date: '01-01', name: "New Year's Day",        emoji: '🎆', type: 'holiday' },
  { date: '01-15', name: 'MLK Day (US)',           emoji: '✊', type: 'holiday' },

  // ── February ───────────────────────────────────────────────────────────────
  { date: '02-02', name: "Groundhog Day",          emoji: '🦔', type: 'awareness' },
  { date: '02-14', name: "Valentine's Day",        emoji: '💝', type: 'holiday' },
  { date: '02-17', name: 'Presidents Day (US)',    emoji: '🇺🇸', type: 'holiday' },

  // ── March ──────────────────────────────────────────────────────────────────
  { date: '03-08', name: "International Women's Day", emoji: '♀️', type: 'awareness' },
  { date: '03-17', name: "St. Patrick's Day",      emoji: '🍀', type: 'holiday' },
  { date: '03-20', name: 'First Day of Spring',    emoji: '🌸', type: 'awareness' },

  // ── April ──────────────────────────────────────────────────────────────────
  { date: '04-01', name: "April Fools' Day",       emoji: '🤡', type: 'awareness' },
  { date: '04-22', name: 'Earth Day',              emoji: '🌍', type: 'awareness' },

  // ── May ────────────────────────────────────────────────────────────────────
  { date: '05-01', name: "International Workers' Day", emoji: '⚒️', type: 'holiday' },
  { date: '05-04', name: 'Star Wars Day',          emoji: '⚡', type: 'awareness' },
  { date: '05-11', name: "Mother's Day",           emoji: '🌹', type: 'holiday' },
  { date: '05-26', name: 'Memorial Day (US)',      emoji: '🇺🇸', type: 'holiday' },

  // ── June ───────────────────────────────────────────────────────────────────
  { date: '06-01', name: 'Pride Month Starts',     emoji: '🏳️‍🌈', type: 'awareness' },
  { date: '06-19', name: 'Juneteenth (US)',         emoji: '✊', type: 'holiday' },
  { date: '06-21', name: 'First Day of Summer',    emoji: '☀️', type: 'awareness' },

  // ── July ───────────────────────────────────────────────────────────────────
  { date: '07-04', name: 'Independence Day (US)',  emoji: '🎆', type: 'holiday' },
  { date: '07-07', name: 'World Chocolate Day',    emoji: '🍫', type: 'awareness' },

  // ── August ─────────────────────────────────────────────────────────────────
  { date: '08-12', name: "International Youth Day", emoji: '🌟', type: 'awareness' },
  { date: '08-19', name: 'World Photo Day',        emoji: '📷', type: 'awareness' },

  // ── September ──────────────────────────────────────────────────────────────
  { date: '09-01', name: 'Labor Day (US)',         emoji: '💼', type: 'holiday' },
  { date: '09-22', name: 'First Day of Fall',      emoji: '🍂', type: 'awareness' },

  // ── October ────────────────────────────────────────────────────────────────
  { date: '10-10', name: 'World Mental Health Day',emoji: '🧠', type: 'awareness' },
  { date: '10-31', name: 'Halloween',              emoji: '🎃', type: 'holiday' },

  // ── November ───────────────────────────────────────────────────────────────
  { date: '11-11', name: "Veterans Day / Remembrance Day", emoji: '🎖️', type: 'holiday' },
  { date: '11-27', name: 'Thanksgiving (US)',      emoji: '🦃', type: 'holiday' },
  { date: '11-28', name: 'Black Friday',           emoji: '🛍️', type: 'shopping' },
  { date: '12-01', name: 'Cyber Monday',           emoji: '💻', type: 'shopping' },

  // ── December ───────────────────────────────────────────────────────────────
  { date: '12-21', name: 'First Day of Winter',   emoji: '❄️', type: 'awareness' },
  { date: '12-24', name: 'Christmas Eve',          emoji: '🎄', type: 'holiday' },
  { date: '12-25', name: 'Christmas Day',          emoji: '🎁', type: 'holiday' },
  { date: '12-31', name: "New Year's Eve",         emoji: '🥂', type: 'holiday' },
];

/** Type → badge color */
export const HOLIDAY_COLORS = {
  holiday:   '#f59e0b',   // amber
  awareness: '#06b6d4',   // cyan
  shopping:  '#10b981',   // green
};

/**
 * Returns holidays that fall on a given Date object.
 * @param {Date} date
 * @returns {Array}
 */
export function getHolidaysForDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return [];
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const key = `${mm}-${dd}`;
  return HOLIDAYS.filter(h => h.date === key);
}
