/**
 * Dark Sun Calendar - Main Integration Module
 * ==========================================
 * Complete Athasian calendar system with astronomical accuracy
 * Integrates all subsystems and provides unified API
 */

import { loadCalendarData } from "./calendar-loader.js";
import {
  initializeCalendarCore,
  getMonths,
  getSeasons,
} from "./athasian-calendar-core.js";

/**
 * Main Dark Sun Calendar Class
 * Coordinates all calendar subsystems and provides the primary API
 */
class DarkSunCalendar {
  constructor() {
    // Initialize subsystems
    this.moonSystem = new window.AthasianMoonEngine.AthasianMoonSystem();
    this.eclipseCalculator = new window.AthasianEclipseEngine.EclipseCalculator(
      this.moonSystem
    );

    // Current calendar state
    this.currentState = {
      kingsAge: 190,
      year: 1,
      dayOfYear: 1,
      hour: 12,
      minute: 0,
    };

    // Calendar metadata
    this.metadata = {
      epochName: "King's Age 190, Year 1, Day 1",
      epochDescription:
        "Grand Eclipse - Both moons full in perfect alignment (new epoch)",
      version: "2.0.0",
      lastUpdate: new Date().toISOString(),
    };

    // No hardcoded monthNames or seasons
    // Validation
    this.validateSystem();
  }

  /**
   * Get complete calendar data for current date
   * @returns {object} Complete calendar information
   */
  getCurrentDate() {
    return this.getDateInfo(
      this.currentState.kingsAge,
      this.currentState.year,
      this.currentState.dayOfYear
    );
  }

  /**
   * Get complete calendar data for any date
   * @param {number} kingsAge - King's Age
   * @param {number} year - Year within the age
   * @param {number} dayOfYear - Day of the year
   * @returns {object} Complete calendar information
   */
  getDateInfo(kingsAge, year, dayOfYear) {
    const absoluteDay = window.AthasianCalendarCore.toAbsoluteDays(
      kingsAge,
      year,
      dayOfYear
    );
    const monthInfo = window.AthasianCalendarCore.resolveMonthAndDay(dayOfYear);
    const yearName = window.AthasianCalendarCore.getYearName(year);
    const moonData = this.moonSystem.getBothMoons(absoluteDay);
    const eclipseInfo = this.eclipseCalculator.getEclipseInfo(absoluteDay);
    const seasonInfo = this.getSeasonInfo(dayOfYear);

    // Use months from calendar.json
    const months = getMonths();
    const monthName = monthInfo.month ? months[monthInfo.month - 1].name : null;

    // Intercalary period information
    const intercalaryInfo = this.getIntercalaryInfo(dayOfYear);

    return {
      // Basic date information
      kingsAge,
      year,
      dayOfYear,
      absoluteDay,
      yearName,

      // Month and day breakdown
      month: monthInfo.month,
      dayInMonth: monthInfo.dayInMonth,
      monthName,

      // Intercalary period information
      intercalary: monthInfo.intercalary,
      dayInIntercalary: monthInfo.dayInIntercalary,
      intercalaryName: intercalaryInfo ? intercalaryInfo.name : null,
      intercalaryDescription: intercalaryInfo
        ? intercalaryInfo.description
        : null,

      // Time information
      hour: this.currentState.hour,
      minute: this.currentState.minute,
      timeString: this.formatTime(
        this.currentState.hour,
        this.currentState.minute
      ),

      // Moon information
      moons: {
        ral: {
          name: "Ral",
          description: "The Green Moon",
          ...moonData.ral,
        },
        guthay: {
          name: "Guthay",
          description: "The Golden Moon",
          ...moonData.guthay,
        },
      },

      // Eclipse information
      eclipse: {
        ...eclipseInfo,
        nextEclipse: this.eclipseCalculator.findNextEclipse(absoluteDay),
        previousEclipse: this.eclipseCalculator.findPreviousEclipse(
          absoluteDay
        ),
      },

      // Season information
      season: seasonInfo,

      // Special events and conditions
      events: this.getSpecialEvents(kingsAge, year, dayOfYear),

      // Free Year calculation (for compatibility)
      freeYear: this.calculateFreeYear(kingsAge, year),

      // Metadata
      metadata: this.metadata,
    };
  }

  /**
   * Calculate season information based on day of year
   * @param {number} dayOfYear - Day of the year
   * @returns {object} Season information
   */
  getSeasonInfo(dayOfYear) {
    const seasons = window.AthasianCalendarCore.getSeasons();
    // Prefer dayStart/dayEnd if present
    for (let s = 0; s < seasons.length; s++) {
      const season = seasons[s];
      if (season.dayStart !== undefined && season.dayEnd !== undefined) {
        // Handle wrap-around (e.g., dayStart=311, dayEnd=60)
        if (season.dayStart <= season.dayEnd) {
          if (dayOfYear >= season.dayStart && dayOfYear <= season.dayEnd) {
            return season;
          }
        } else {
          // Wrap-around season
          if (dayOfYear >= season.dayStart || dayOfYear <= season.dayEnd) {
            return season;
          }
        }
      }
    }
    // Fallback to old month-based logic if no match
    const months = window.AthasianCalendarCore.getMonths();
    const monthInfo = window.AthasianCalendarCore.resolveMonthAndDay(dayOfYear);
    const currentMonth = monthInfo.month; // 1-based
    if (!currentMonth) {
      return { number: null, name: null, description: null, dayInSeason: null };
    }
    for (let s = 0; s < seasons.length; s++) {
      const { monthStart, monthEnd, name, description } = seasons[s];
      if (
        (monthStart <= monthEnd &&
          currentMonth >= monthStart &&
          currentMonth <= monthEnd) ||
        (monthStart > monthEnd &&
          (currentMonth >= monthStart || currentMonth <= monthEnd))
      ) {
        return {
          number: s + 1,
          name,
          description,
          dayInSeason: null,
        };
      }
    }
    return { number: null, name: null, description: null, dayInSeason: null };
  }

  /**
   * Get intercalary period info for a given dayOfYear
   * @param {number} dayOfYear
   * @returns {object|null} Intercalary period object or null
   */
  getIntercalaryInfo(dayOfYear) {
    const intercalary = window.AthasianCalendarCore.getIntercalary();
    for (let i = 0; i < intercalary.length; i++) {
      const period = intercalary[i];
      if (dayOfYear >= period.dayStart && dayOfYear <= period.dayEnd) {
        return period;
      }
    }
    return null;
  }

  /**
   * Get special events for a given date
   * @param {number} kingsAge - King's Age
   * @param {number} year - Year within the age
   * @param {number} dayOfYear - Day of the year
   * @returns {Array} Array of special events
   */
  getSpecialEvents(kingsAge, year, dayOfYear) {
    const events = [];
    const absoluteDay = window.AthasianCalendarCore.toAbsoluteDays(
      kingsAge,
      year,
      dayOfYear
    );

    // Eclipse events
    const eclipseInfo = this.eclipseCalculator.getEclipseInfo(absoluteDay);
    if (eclipseInfo.type !== window.AthasianEclipseEngine.EclipseType.NONE) {
      events.push({
        type: "eclipse",
        importance:
          eclipseInfo.type === window.AthasianEclipseEngine.EclipseType.GRAND
            ? "critical"
            : "major",
        title: `${
          eclipseInfo.type.charAt(0).toUpperCase() + eclipseInfo.type.slice(1)
        } Eclipse`,
        description: eclipseInfo.description,
        duration: eclipseInfo.duration,
      });
    }

    // Messenger appearances (every 45 years until KA 190)
    if (kingsAge < 190 && year % 45 === 0) {
      events.push({
        type: "messenger",
        importance: "major",
        title: "The Messenger Appears",
        description:
          "The mysterious comet known as the Messenger streaks across the Athasian sky",
        duration: 30, // Visible for 30 days
      });
    }

    // Intercalary period events
    const monthInfo = window.AthasianCalendarCore.resolveMonthAndDay(dayOfYear);
    if (monthInfo.intercalary) {
      const intercalaryEvent = {
        type: "intercalary",
        importance: "minor",
        title: this.getIntercalaryName(monthInfo.intercalary),
        description: this.getIntercalaryDescription(monthInfo.intercalary),
        duration: 5,
      };
      events.push(intercalaryEvent);
    }

    // Historical events (would be loaded from historical_events.json)
    const historicalEvents = this.getHistoricalEvents(
      kingsAge,
      year,
      dayOfYear
    );
    events.push(...historicalEvents);

    return events.sort((a, b) => {
      const importanceOrder = { critical: 0, major: 1, minor: 2 };
      return importanceOrder[a.importance] - importanceOrder[b.importance];
    });
  }

  /**
   * Get description for intercalary periods
   * @param {number} intercalary - Intercalary period number (1-based)
   * @returns {string|null} Description
   */
  getIntercalaryDescription(intercalary) {
    const intercalaryList = window.AthasianCalendarCore.getIntercalary();
    if (
      intercalaryList &&
      intercalary >= 1 &&
      intercalary <= intercalaryList.length &&
      intercalaryList[intercalary - 1].description
    ) {
      return intercalaryList[intercalary - 1].description;
    }
    return null;
  }

  /**
   * Get historical events for a date (placeholder - would load from JSON)
   * @param {number} kingsAge - King's Age
   * @param {number} year - Year within the age
   * @param {number} dayOfYear - Day of the year
   * @returns {Array} Historical events
   */
  getHistoricalEvents(kingsAge, year, dayOfYear) {
    // This would load and filter from historical_events.json
    // For now, return empty array
    return [];
  }

  /**
   * Calculate Free Year for compatibility
   * @param {number} kingsAge - King's Age
   * @param {number} year - Year within the age
   * @returns {number} Free Year
   */
  calculateFreeYear(kingsAge, year) {
    // Free Year calculation: (KingsAge - 190) * 77 + (Year - 26) + 1
    return (kingsAge - 190) * 77 + (year - 26) + 1;
  }

  /**
   * Format time as HH:MM string
   * @param {number} hour - Hour (0-23)
   * @param {number} minute - Minute (0-59)
   * @returns {string} Formatted time
   */
  formatTime(hour, minute) {
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  }

  /**
   * Set current date
   * @param {number} kingsAge - King's Age
   * @param {number} year - Year within the age
   * @param {number} dayOfYear - Day of the year
   */
  setDate(kingsAge, year, dayOfYear) {
    console.log("DSC.setDate called with", { kingsAge, year, dayOfYear });
    this.currentState.kingsAge = kingsAge;
    this.currentState.year = year;
    this.currentState.dayOfYear = dayOfYear;
  }

  /**
   * Set current time
   * @param {number} hour - Hour (0-23)
   * @param {number} minute - Minute (0-59)
   */
  setTime(hour, minute) {
    this.currentState.hour = hour;
    this.currentState.minute = minute;
  }

  /**
   * Advance the calendar by a number of days
   * @param {number} days - Number of days to advance (can be negative)
   */
  advanceDays(days) {
    const currentAbsolute = window.AthasianCalendarCore.toAbsoluteDays(
      this.currentState.kingsAge,
      this.currentState.year,
      this.currentState.dayOfYear
    );

    const newAbsolute = currentAbsolute + days;
    const newDate = window.AthasianCalendarCore.fromAbsoluteDays(newAbsolute);

    this.currentState.kingsAge = newDate.kingsAge;
    this.currentState.year = newDate.year;
    this.currentState.dayOfYear = newDate.dayOfYear;
  }

  /**
   * Set date by month and day
   * @param {string} monthName - Name of the month
   * @param {number} day - Day within the month
   */
  setDateByMonthAndDay(monthName, day) {
    const monthIndex = this.monthNames.indexOf(monthName);
    if (monthIndex === -1) {
      throw new Error(`Invalid month name: ${monthName}`);
    }

    const dayOfYear = window.AthasianCalendarCore.monthAndDayToDayOfYear(
      monthIndex + 1,
      day
    );
    this.currentState.dayOfYear = dayOfYear;
  }

  /**
   * Get next eclipse information
   * @returns {object|null} Next eclipse info
   */
  getNextEclipse() {
    const currentAbsolute = window.AthasianCalendarCore.toAbsoluteDays(
      this.currentState.kingsAge,
      this.currentState.year,
      this.currentState.dayOfYear
    );

    return this.eclipseCalculator.findNextEclipse(currentAbsolute);
  }

  /**
   * Get eclipse calendar for current year
   * @returns {Array} Eclipse events for the year
   */
  getYearlyEclipses() {
    return this.eclipseCalculator.getYearlyEclipseCalendar(
      this.currentState.kingsAge,
      this.currentState.year
    );
  }

  /**
   * Validate all subsystems
   * @returns {boolean} True if validation passes
   */
  validateSystem() {
    try {
      // Validate core calendar math
      window.AthasianCalendarCore.validateCalendarMath();

      // Validate moon system
      this.moonSystem.validateSystem();

      // Validate eclipse system
      this.eclipseCalculator.validateEclipseSystem();

      return true;
    } catch (error) {
      console.error("Dark Sun Calendar validation failed:", error);
      throw error;
    }
  }

  /**
   * Get system diagnostic information
   * @returns {object} Diagnostic data
   */
  getDiagnostics() {
    const currentDate = this.getCurrentDate();
    const nextEclipse = this.getNextEclipse();

    return {
      version: this.metadata.version,
      currentDate: `KA${currentDate.kingsAge}, Y${currentDate.year}, D${currentDate.dayOfYear}`,
      currentYearName: currentDate.yearName,
      absoluteDay: currentDate.absoluteDay,
      moonPhases: {
        ral: `${currentDate.moons.ral.phaseName} (${currentDate.moons.ral.illumination}%)`,
        guthay: `${currentDate.moons.guthay.phaseName} (${currentDate.moons.guthay.illumination}%)`,
      },
      currentEclipse: currentDate.eclipse.type,
      nextEclipse: nextEclipse
        ? {
            date: window.AthasianCalendarCore.fromAbsoluteDays(
              nextEclipse.absoluteDay
            ),
            type: nextEclipse.type,
            daysUntil: nextEclipse.absoluteDay - currentDate.absoluteDay,
          }
        : null,
      systemValidation: "PASSED",
    };
  }

  // Helper to get intercalary name from JSON
  getIntercalaryName(intercalaryNum) {
    const intercalary = window.AthasianCalendarCore.getIntercalary?.();
    if (intercalary && intercalary[intercalaryNum - 1]) {
      return intercalary[intercalaryNum - 1].name;
    }
    return null;
  }
}

// Initialize global instance when loaded
let darkSunCalendar = null;

// Async initialization wrapper
export async function initializeDarkSunCalendar() {
  // Load calendar.json
  const calendarData = await loadCalendarData();
  initializeCalendarCore(calendarData);
  // Now safe to create the calendar instance
  return new DarkSunCalendar();
}

// Export for different environments
if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = {
    DarkSunCalendar,
    initializeDarkSunCalendar,
  };
} else {
  // Browser/FoundryVTT environment
  window.DarkSunCalendar = DarkSunCalendar;
  window.initializeDarkSunCalendar = initializeDarkSunCalendar;

  // Auto-initialize if in browser
  if (typeof window !== "undefined") {
    window.addEventListener("load", async () => {
      try {
        darkSunCalendar = await initializeDarkSunCalendar();
        console.log("Dark Sun Calendar initialized successfully");
        console.log("Diagnostics:", darkSunCalendar.getDiagnostics());
      } catch (error) {
        console.error("Failed to initialize Dark Sun Calendar:", error);
      }
    });
  }
}
