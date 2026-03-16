// Five Element (오행) types and colors
export type OhaengElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export const OHAENG_COLORS: Record<OhaengElement, string> = {
  wood: '#00A651',   // 목 - green
  fire: '#C40808',   // 화 - red
  earth: '#F0FF00',  // 토 - yellow
  metal: '#FFFFFF',  // 금 - white
  water: '#212121',  // 수 - black
};

// Heavenly Stems (천간) and their elements
const STEM_ELEMENTS: OhaengElement[] = [
  'wood', 'wood',   // 갑, 을
  'fire', 'fire',   // 병, 정
  'earth', 'earth', // 무, 기
  'metal', 'metal', // 경, 신
  'water', 'water', // 임, 계
];

// Earthly Branches (지지) and their elements
const BRANCH_ELEMENTS: OhaengElement[] = [
  'water',  // 자
  'earth',  // 축
  'wood',   // 인
  'wood',   // 묘
  'earth',  // 진
  'fire',   // 사
  'fire',   // 오
  'earth',  // 미
  'metal',  // 신
  'metal',  // 유
  'earth',  // 술
  'water',  // 해
];

// Year stem element (천간 of year determines year fill color)
export function getYearElement(year: number): OhaengElement {
  const stemIdx = (year - 4) % 10;
  return STEM_ELEMENTS[stemIdx];
}

// Month stem element
// Solar term boundaries (approximate dates for each lunar month start)
const MONTH_BOUNDARIES = [
  { m: 2, d: 4 },   // 인월 (1st)
  { m: 3, d: 6 },   // 묘월 (2nd)
  { m: 4, d: 5 },   // 진월 (3rd)
  { m: 5, d: 6 },   // 사월 (4th)
  { m: 6, d: 6 },   // 오월 (5th)
  { m: 7, d: 7 },   // 미월 (6th)
  { m: 8, d: 7 },   // 신월 (7th)
  { m: 9, d: 8 },   // 유월 (8th)
  { m: 10, d: 8 },  // 술월 (9th)
  { m: 11, d: 7 },  // 해월 (10th)
  { m: 12, d: 7 },  // 자월 (11th)
  { m: 1, d: 6 },   // 축월 (12th)
];

function getLunarMonthIndex(solarMonth: number, solarDay: number): number {
  for (let i = MONTH_BOUNDARIES.length - 1; i >= 0; i--) {
    const b = MONTH_BOUNDARIES[i];
    if (solarMonth > b.m || (solarMonth === b.m && solarDay >= b.d)) {
      return i;
    }
  }
  return 11;
}

export function getMonthElement(year: number, month: number, day: number): OhaengElement {
  const yearStemIdx = (year - 4) % 10;
  const lunarIdx = getLunarMonthIndex(month, day);
  const firstMonthStem = ((yearStemIdx % 5) * 2 + 2) % 10;
  const stemIdx = (firstMonthStem + lunarIdx) % 10;
  return STEM_ELEMENTS[stemIdx];
}

// Day stem element
export function getDayElement(year: number, month: number, day: number): OhaengElement {
  // Reference: 2026-03-06 = 기묘일 (cycle position 15, stem=5)
  const refDate = new Date(2026, 2, 6);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.round((targetDate.getTime() - refDate.getTime()) / (86400000));
  const cyclePos = (((diffDays % 60) + 60) % 60 + 15) % 60;
  const stemIdx = cyclePos % 10;
  return STEM_ELEMENTS[stemIdx];
}

// Hour branch element (지지 of hour determines stroke color)
export function getHourElement(hour: number): OhaengElement {
  const branchIdx = Math.floor(((hour + 1) % 24) / 2);
  return BRANCH_ELEMENTS[branchIdx];
}

// Combined data for current date/time
export function getOhaengData(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();

  return {
    yearColor: OHAENG_COLORS[getYearElement(y)],
    monthColor: OHAENG_COLORS[getMonthElement(y, m, d)],
    dayColor: OHAENG_COLORS[getDayElement(y, m, d)],
    hourStrokeColor: OHAENG_COLORS[getHourElement(h)],
  };
}
