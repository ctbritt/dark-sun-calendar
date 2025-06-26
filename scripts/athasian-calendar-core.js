/**
 * Athasian Calendar Core - Mathematical Foundation
 * ===============================================
 * Astronomically accurate dual moon system for the Dark Sun setting
 * Reference Point: King's Age 190, Year 1, Day 1 = Perfect Eclipse (Absolute Day 0)
 */

// Module-level variable to hold loaded calendar data
let CALENDAR_DATA = null;

/**
 * Initialize the calendar core with loaded data
 * @param {object} calendarData - Parsed calendar.json data
 */
export function initializeCalendarCore(calendarData) {
  CALENDAR_DATA = calendarData;
  // console.log("[DSC] CALENDAR_DATA initialized:", CALENDAR_DATA);
  // console.log("[DSC] Months loaded:", CALENDAR_DATA.months);
  // console.log("[DSC] Intercalary periods loaded:", CALENDAR_DATA.intercalary);
  // console.log(
  //   "[DSC] Year names loaded:",
  //   CALENDAR_DATA.extensions?.["seasons-and-stars"]?.namedYears?.names
  // );
}

// Helper to ensure data is loaded
function requireCalendarData() {
  if (!CALENDAR_DATA) {
    console.warn("[DSC] CALENDAR_DATA is not loaded!");
    throw new Error("Calendar data not loaded");
  }
}

// Data-driven helpers
export function getMonths() {
  requireCalendarData();
  return CALENDAR_DATA.months;
}
export function getIntercalary() {
  requireCalendarData();
  return CALENDAR_DATA.intercalary;
}
function getYearNames() {
  requireCalendarData();
  return (
    CALENDAR_DATA.extensions?.["seasons-and-stars"]?.namedYears?.names || []
  );
}
function getMonthsPerYear() {
  return getMonths().length;
}
function getIntercalaryPeriods() {
  return getIntercalary().length;
}
function getDaysPerMonth(monthIdx) {
  return getMonths()[monthIdx].days;
}
function getDaysInIntercalary(interIdx) {
  return getIntercalary()[interIdx].days;
}
export function getTotalDaysPerYear() {
  // Sum all month days and intercalary days
  return (
    getMonths().reduce((sum, m) => sum + m.days, 0) +
    getIntercalary().reduce((sum, i) => sum + i.days, 0)
  );
}

// Calendar Constants
const DAYS_PER_YEAR = 375;
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const INTERCALARY_DAYS = 5;
const INTERCALARY_PERIODS = 3;
const YEARS_PER_KINGS_AGE = 77;

// Intercalary periods occur after months 4, 8, and 12
const INTERCALARY_AFTER_MONTHS = [4, 8, 12];

// Moon Constants
const RAL_PERIOD = 33;
const GUTHAY_PERIOD = 125;
const ECLIPSE_CYCLE = 4125; // LCM of 33 and 125

// Year Name Cycles
const ENDLEAN_CYCLE = [
  "Ral",
  "Friend",
  "Desert",
  "Priest",
  "Wind",
  "Dragon",
  "Mountain",
  "King",
  "Silt",
  "Enemy",
  "Guthay",
];

const SOFEAN_CYCLE = [
  "Fury",
  "Contemplation",
  "Vengeance",
  "Slumber",
  "Defiance",
  "Reverence",
  "Agitation",
];

// New epoch offset: days from KA 1, Y1, D1 to KA 1, Y1, D1
const EPOCH_OFFSET = 0; // Now epoch is KA1, Y1, D1

/**
 * Core Date Conversion Functions
 */

/**
 * Convert King's Age, Year, Day to absolute days since new epoch (KA 190, Y1, D1)
 * @param {number} kingsAge - King's Age number (1+)
 * @param {number} year - Year within the age (1-77)
 * @param {number} dayOfYear - Day of the year (1-375)
 * @returns {number} Absolute days since new epoch (0-based)
 */
function toAbsoluteDays(kingsAge, year, dayOfYear) {
  requireCalendarData();
  const yearsPerKingsAge =
    CALENDAR_DATA.extensions?.["seasons-and-stars"]?.namedYears?.names
      ?.length || 77;
  const totalDaysPerYear = getTotalDaysPerYear();
  if (kingsAge < 1) throw new RangeError("King's Age must be ≥ 1");
  if (year < 1 || year > yearsPerKingsAge)
    throw new RangeError("Year must be 1-" + yearsPerKingsAge);
  if (dayOfYear < 1 || dayOfYear > totalDaysPerYear)
    throw new RangeError("Day of year must be 1-" + totalDaysPerYear);
  const yearsFromEpoch = (kingsAge - 1) * yearsPerKingsAge + (year - 1);
  return yearsFromEpoch * totalDaysPerYear + (dayOfYear - 1) - EPOCH_OFFSET;
}

/**
 * Convert absolute days back to calendar date (relative to new epoch)
 * @param {number} absoluteDays - Absolute days since new epoch (0-based)
 * @returns {object} Calendar date {kingsAge, year, dayOfYear}
 */
function fromAbsoluteDays(absoluteDays) {
  requireCalendarData();
  const yearsPerKingsAge =
    CALENDAR_DATA.extensions?.["seasons-and-stars"]?.namedYears?.names
      ?.length || 77;
  const totalDaysPerYear = getTotalDaysPerYear();
  if (absoluteDays < 0) throw new RangeError("Absolute days must be ≥ 0");
  const totalDays = absoluteDays + EPOCH_OFFSET;
  const totalYears = Math.floor(totalDays / totalDaysPerYear);
  const kingsAge = Math.floor(totalYears / yearsPerKingsAge) + 1;
  const year = (totalYears % yearsPerKingsAge) + 1;
  const dayOfYear = (totalDays % totalDaysPerYear) + 1;
  return { kingsAge, year, dayOfYear };
}

/**
 * Generate year name from Endlean and Sofean cycles
 * @param {number} year - Year within the age (1-77)
 * @returns {string} Year name (e.g., "Ral's Fury")
 */
function getYearName(year) {
  if (year < 1 || year > YEARS_PER_KINGS_AGE)
    throw new RangeError("Year must be 1-77");

  const endleanIndex = (year - 1) % ENDLEAN_CYCLE.length;
  const sofeanIndex = (year - 1) % SOFEAN_CYCLE.length;

  return `${ENDLEAN_CYCLE[endleanIndex]}'s ${SOFEAN_CYCLE[sofeanIndex]}`;
}

/**
 * Convert day of year to month and day within month
 * @param {number} dayOfYear - Day of the year (1-375)
 * @returns {object} Month info {month, dayInMonth, intercalary, dayInIntercalary}
 */
function resolveMonthAndDay(dayOfYear) {
  requireCalendarData();
  const months = getMonths();
  const intercalary = getIntercalary();
  const totalDaysPerYear = getTotalDaysPerYear();
  if (dayOfYear < 1 || dayOfYear > totalDaysPerYear)
    throw new RangeError("Day of year must be 1-" + totalDaysPerYear);
  let cursor = 0;
  for (let m = 0; m < months.length; m++) {
    cursor += months[m].days;
    if (dayOfYear <= cursor) {
      const dayInMonth = dayOfYear - (cursor - months[m].days);
      return {
        month: m + 1,
        dayInMonth,
        intercalary: null,
        dayInIntercalary: null,
      };
    }
    // Check for intercalary after this month
    const inter = intercalary.find((i) => i.after === m + 1);
    if (inter) {
      const interStart = cursor + 1;
      const interEnd = cursor + inter.days;
      if (dayOfYear >= interStart && dayOfYear <= interEnd) {
        const dayInIntercalary = dayOfYear - interStart + 1;
        const interIdx = intercalary.indexOf(inter) + 1;
        return {
          month: null,
          dayInMonth: null,
          intercalary: interIdx,
          dayInIntercalary,
        };
      }
      cursor += inter.days;
    }
  }
  throw new Error("Month resolution failure");
}

/**
 * Convert month and day to day of year
 * @param {number} month - Month number (1-12)
 * @param {number} dayInMonth - Day within the month (1-30)
 * @returns {number} Day of year (1-375)
 */
function monthAndDayToDayOfYear(month, dayInMonth) {
  requireCalendarData();
  const months = getMonths();
  const intercalary = getIntercalary();
  if (month < 1 || month > months.length)
    throw new RangeError("Month must be 1-" + months.length);
  if (dayInMonth < 1 || dayInMonth > months[month - 1].days)
    throw new RangeError("Day in month must be 1-" + months[month - 1].days);
  let dayOfYear = 0;
  for (let m = 0; m < month - 1; m++) {
    dayOfYear += months[m].days;
    // Add intercalary after this month if present
    const inter = intercalary.find((i) => i.after === m + 1);
    if (inter) dayOfYear += inter.days;
  }
  dayOfYear += dayInMonth;
  return dayOfYear;
}

/**
 * Convert intercalary period and day to day of year
 * @param {number} intercalary - Intercalary period number (1-3)
 * @param {number} dayInIntercalary - Day within the intercalary period (1-5)
 * @returns {number} Day of year (1-375)
 */
function intercalaryToDayOfYear(intercalaryNum, dayInIntercalary) {
  requireCalendarData();
  const intercalary = getIntercalary();
  if (intercalaryNum < 1 || intercalaryNum > intercalary.length)
    throw new RangeError("Intercalary must be 1-" + intercalary.length);
  if (
    dayInIntercalary < 1 ||
    dayInIntercalary > intercalary[intercalaryNum - 1].days
  )
    throw new RangeError(
      "Day in intercalary must be 1-" + intercalary[intercalaryNum - 1].days
    );
  let dayOfYear = 0;
  const months = getMonths();
  for (let m = 0; m < months.length; m++) {
    dayOfYear += months[m].days;
    const inter = getIntercalary().find((i) => i.after === m + 1);
    if (inter) {
      if (getIntercalary().indexOf(inter) + 1 === intercalaryNum) {
        dayOfYear += dayInIntercalary;
        return dayOfYear;
      } else {
        dayOfYear += inter.days;
      }
    }
  }
  throw new Error("Intercalary resolution failure");
}

/**
 * Validation Functions
 */

/**
 * Validate that the calendar math is internally consistent
 * @returns {boolean} True if validation passes
 */
function validateCalendarMath() {
  // Test round-trip conversion
  const testDate = { kingsAge: 190, year: 10, dayOfYear: 200 };
  const absoluteDays = toAbsoluteDays(
    testDate.kingsAge,
    testDate.year,
    testDate.dayOfYear
  );
  const converted = fromAbsoluteDays(absoluteDays);

  if (
    converted.kingsAge !== testDate.kingsAge ||
    converted.year !== testDate.year ||
    converted.dayOfYear !== testDate.dayOfYear
  ) {
    throw new Error("Round-trip conversion failed");
  }

  // Test month resolution
  for (let day = 1; day <= DAYS_PER_YEAR; day++) {
    const monthInfo = resolveMonthAndDay(day);

    let reconstructedDay;
    if (monthInfo.month !== null) {
      reconstructedDay = monthAndDayToDayOfYear(
        monthInfo.month,
        monthInfo.dayInMonth
      );
    } else {
      reconstructedDay = intercalaryToDayOfYear(
        monthInfo.intercalary,
        monthInfo.dayInIntercalary
      );
    }

    if (reconstructedDay !== day) {
      throw new Error(`Month resolution mismatch at day ${day}`);
    }
  }

  // Test year names
  for (let year = 1; year <= YEARS_PER_KINGS_AGE; year++) {
    const yearName = getYearName(year);
    if (!yearName || !yearName.includes("'s")) {
      throw new Error(`Invalid year name for year ${year}: ${yearName}`);
    }
  }

  return true;
}

/**
 * Convert (kingsAge, yearInAge) to absolute year (1-based)
 * @param {number} kingsAge
 * @param {number} yearInAge
 * @returns {number} absoluteYear
 */
function toAbsoluteYear(kingsAge, yearInAge) {
  return (kingsAge - 1) * YEARS_PER_KINGS_AGE + yearInAge;
}

/**
 * Convert absolute year (1-based) to {kingsAge, yearInAge}
 * @param {number} absoluteYear
 * @returns {{kingsAge: number, yearInAge: number}}
 */
function fromAbsoluteYear(absoluteYear) {
  return {
    kingsAge: Math.floor((absoluteYear - 1) / YEARS_PER_KINGS_AGE) + 1,
    yearInAge: ((absoluteYear - 1) % YEARS_PER_KINGS_AGE) + 1,
  };
}

// Export functions for use in other modules
if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = {
    toAbsoluteDays,
    fromAbsoluteDays,
    getYearName,
    resolveMonthAndDay,
    monthAndDayToDayOfYear,
    intercalaryToDayOfYear,
    validateCalendarMath,
    DAYS_PER_YEAR,
    YEARS_PER_KINGS_AGE,
    RAL_PERIOD,
    GUTHAY_PERIOD,
    ECLIPSE_CYCLE,
    ENDLEAN_CYCLE,
    SOFEAN_CYCLE,
    getSeasons,
    getTotalDaysPerYear,
    toAbsoluteYear,
    fromAbsoluteYear,
  };
} else {
  // Browser/FoundryVTT environment
  window.AthasianCalendarCore = {
    toAbsoluteDays,
    fromAbsoluteDays,
    getYearName,
    resolveMonthAndDay,
    monthAndDayToDayOfYear,
    intercalaryToDayOfYear,
    validateCalendarMath,
    DAYS_PER_YEAR,
    YEARS_PER_KINGS_AGE,
    RAL_PERIOD,
    GUTHAY_PERIOD,
    ECLIPSE_CYCLE,
    ENDLEAN_CYCLE,
    SOFEAN_CYCLE,
    getSeasons,
    getTotalDaysPerYear,
    getMonths,
    getIntercalary,
    toAbsoluteYear,
    fromAbsoluteYear,
  };
}

export function getSeasons() {
  requireCalendarData();
  return CALENDAR_DATA.seasons;
}
