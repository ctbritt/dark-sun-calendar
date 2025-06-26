/**
 * Seasons & Stars Integration for Dark Sun Calendar
 * ================================================
 * Enhanced integration with the Seasons & Stars module for FoundryVTT
 * Provides bidirectional synchronization and astronomical enhancements
 */

/**
 * Seasons & Stars Integration Class
 */
class SeasonsStarsIntegration {
  constructor(darkSunCalendar) {
    this.darkSunCalendar = darkSunCalendar;
    this.seasonsStarsAPI = null;
    this.isInitialized = false;
    this.syncEnabled = true;
    this.enhancementsEnabled = true;

    // Dark Sun specific calendar ID
    this.calendarId = "dark-sun";

    this.initialize();
  }

  /**
   * Initialize the integration
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Wait for Seasons & Stars to be available
      await this.waitForSeasonsStars();

      // Setup API reference
      this.seasonsStarsAPI = game.seasonsStars?.api;

      if (!this.seasonsStarsAPI) {
        console.warn(
          "Dark Sun Calendar: Seasons & Stars API not available - running in standalone mode"
        );
        return;
      }

      // Setup hooks and synchronization
      this.setupHooks();

      // Enhance Seasons & Stars with our astronomical data
      if (this.enhancementsEnabled) {
        this.enhanceSeasonsStars();
      }

      // Initial synchronization
      if (this.syncEnabled) {
        await this.syncFromSeasonsStars();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Failed to initialize Seasons & Stars integration:",
        error
      );
    }
  }

  /**
   * Wait for Seasons & Stars to be available
   */
  async waitForSeasonsStars() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (game.seasonsStars?.api) {
          clearInterval(checkInterval);
          resolve();
        } else if (game.modules.get("seasons-and-stars")?.active === false) {
          // Module not active, resolve to continue in standalone mode
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 10000);
    });
  }

  /**
   * Setup Foundry hooks for integration
   */
  setupHooks() {
    // Listen for Seasons & Stars date changes
    Hooks.on("seasons-stars:dateChanged", (data) => {
      if (this.syncEnabled && data.newDate) {
        const nd = data.newDate;
        this.onSeasonsStarsDateChange(data.newDate);
      }
    });

    // Listen for calendar changes
    Hooks.on("seasons-stars:calendarChanged", (data) => {
      if (data.calendarId === this.calendarId) {
        this.syncFromSeasonsStars();
      }
    });

    // Hook into world time updates
    Hooks.on("updateWorldTime", (worldTime, dt) => {
      if (this.syncEnabled && this.seasonsStarsAPI) {
        // Let Seasons & Stars handle the conversion
        const currentDate = this.seasonsStarsAPI.getCurrentDate(
          this.calendarId
        );
        if (currentDate) {
          this.updateDarkSunCalendar(currentDate);
        }
      }
    });
  }

  /**
   * Handle date changes from Seasons & Stars
   */
  async onSeasonsStarsDateChange(newDate) {
    try {
      this.updateDarkSunCalendar(newDate);

      // Add astronomical enhancements to the date change
      if (this.enhancementsEnabled) {
        await this.addAstronomicalEnhancements(newDate);
      }
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error handling Seasons & Stars date change:",
        error
      );
    }
  }

  /**
   * Update Dark Sun Calendar from Seasons & Stars date
   */
  updateDarkSunCalendar(seasonsStarsDate) {
    try {
      // Extract date components from Seasons & Stars format
      const { year, month, day } = this.parseSeasonsStarsDate(seasonsStarsDate);

      // Use S&S year as yearInAge, keep current kingsAge from DSC
      const yearInAge = typeof year === "number" ? year : 1;
      const currentDSCDate = this.darkSunCalendar.getCurrentDate();
      const kingsAge = currentDSCDate.kingsAge;

      // Guard: If current DSC date is intercalary and incoming S&S date is not, ignore update
      const isDSCIntercalary =
        currentDSCDate.intercalary !== null &&
        currentDSCDate.intercalary !== undefined;
      // S&S never sends intercalary, so if month is defined, it's not intercalary
      const isSSIntercalary = false;
      if (isDSCIntercalary && !isSSIntercalary) {
        console.warn(
          "S&S tried to overwrite an intercalary day with a non-intercalary date. Ignoring."
        );
        return;
      }

      // Calculate day of year from month and day
      const dayOfYear = this.calculateDayOfYear(month, day);

      // Update our calendar
      this.darkSunCalendar.setDate(kingsAge, yearInAge, dayOfYear);

      // Also update Foundry settings to prevent overwrite
      game.settings.set("dark-sun-calendar", "kingsAge", kingsAge);
      game.settings.set("dark-sun-calendar", "yearInAge", yearInAge);
      game.settings.set("dark-sun-calendar", "dayOfYear", dayOfYear);
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error updating from Seasons & Stars:",
        error
      );
    }
  }

  /**
   * Parse Seasons & Stars date format
   */
  parseSeasonsStarsDate(date) {
    // Handle different possible date formats from Seasons & Stars
    if (typeof date === "object" && date !== null) {
      return {
        year: date.year || 1,
        month: date.month || 1,
        day: date.day || 1,
      };
    }

    // Fallback parsing
    return { year: 1, month: 1, day: 1 };
  }

  /**
   * Calculate day of year from month and day
   */
  calculateDayOfYear(month, day) {
    try {
      return window.AthasianCalendarCore.monthAndDayToDayOfYear(month, day);
    } catch (error) {
      // Handle intercalary periods or invalid dates
      console.warn("Dark Sun Calendar: Invalid date conversion, using day 1");
      return 1;
    }
  }

  /**
   * Check if the integration is enabled and ready
   */
  isEnabled() {
    return this.isInitialized && this.syncEnabled && this.seasonsStarsAPI;
  }

  /**
   * Sync Dark Sun Calendar to Seasons & Stars
   */
  async syncToSeasonsStars(darkSunDate) {
    try {
      if (!this.isEnabled()) {
        return;
      }

      const ssFormat = this.convertToSeasonsStarsFormat(darkSunDate);
      if (!ssFormat) {
        console.warn("Dark Sun Calendar: Failed to convert date for S&S sync");
        return;
      }

      // Create the date object that S&S expects
      const dateData = {
        year: ssFormat.year,
        month: ssFormat.month,
        day: ssFormat.day,
        weekday: 0, // Will be calculated by S&S
        time: { hour: 0, minute: 0, second: 0 },
      };

      // Set the date in S&S using the API
      await this.seasonsStarsAPI.setCurrentDate(dateData);
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error syncing to Seasons & Stars:",
        error
      );
    }
  }

  /**
   * Sync from Seasons & Stars to Dark Sun Calendar
   */
  async syncFromSeasonsStars() {
    if (!this.seasonsStarsAPI || !this.syncEnabled) return;

    try {
      const currentDate = this.seasonsStarsAPI.getCurrentDate(this.calendarId);
      if (currentDate) {
        this.updateDarkSunCalendar(currentDate);
      }
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error syncing from Seasons & Stars:",
        error
      );
    }
  }

  /**
   * Convert Dark Sun date to Seasons & Stars format
   */
  convertToSeasonsStarsFormat(darkSunDate) {
    try {
      // Only convert day of year to month and day, keep S&S year as is
      let month = 1;
      let day = 1;

      // Convert day of year to month and day
      if (darkSunDate.dayOfYear && darkSunDate.dayOfYear > 0) {
        const monthInfo = window.AthasianCalendarCore.resolveMonthAndDay(
          darkSunDate.dayOfYear
        );
        if (monthInfo.month) {
          month = monthInfo.month;
          day = monthInfo.dayInMonth;
        }
      }

      return {
        year: darkSunDate.yearInAge, // Use yearInAge as S&S year
        month: month,
        day: day,
        // Add any additional Seasons & Stars specific properties
        calendarId: this.calendarId,
      };
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error converting to Seasons & Stars format:",
        error
      );
      return null;
    }
  }

  /**
   * Enhance Seasons & Stars with astronomical data
   */
  enhanceSeasonsStars() {
    if (!this.seasonsStarsAPI) return;

    try {
      // Add Dark Sun specific API methods to Seasons & Stars
      this.seasonsStarsAPI.darkSun = {
        getMoonPhases: () => {
          const currentDate = this.darkSunCalendar.getCurrentDate();
          return {
            ral: currentDate.moons.ral,
            guthay: currentDate.moons.guthay,
          };
        },

        getEclipseInfo: () => {
          const currentDate = this.darkSunCalendar.getCurrentDate();
          return currentDate.eclipse;
        },

        getNextEclipse: () => {
          return this.darkSunCalendar.getNextEclipse();
        },

        getYearName: () => {
          const currentDate = this.darkSunCalendar.getCurrentDate();
          return currentDate.yearName;
        },

        getKingsAge: () => {
          const currentDate = this.darkSunCalendar.getCurrentDate();
          return {
            kingsAge: currentDate.kingsAge,
            year: currentDate.year,
          };
        },

        advanceDays: async (days) => {
          this.darkSunCalendar.advanceDays(days);
          if (this.syncEnabled) {
            await this.syncToSeasonsStars();
          }
        },
      };
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error enhancing Seasons & Stars:",
        error
      );
    }
  }

  /**
   * Add astronomical enhancements to date changes
   */
  async addAstronomicalEnhancements(date) {
    try {
      const currentDate = this.darkSunCalendar.getCurrentDate();

      // Check for eclipses and notify
      if (currentDate.eclipse.type !== "none") {
        this.notifyEclipse(currentDate.eclipse);
      }

      // Add moon phase information to chat
      this.addMoonPhaseInfo(currentDate.moons);
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Error adding astronomical enhancements:",
        error
      );
    }
  }

  /**
   * Notify about eclipses
   */
  notifyEclipse(eclipseInfo) {
    if (game.settings.get("dark-sun-calendar", "showEclipses")) {
      ui.notifications.info(
        `🌙 ${
          eclipseInfo.type.charAt(0).toUpperCase() + eclipseInfo.type.slice(1)
        } Eclipse: ${eclipseInfo.description}`
      );
    }
  }

  /**
   * Add moon phase information
   */
  addMoonPhaseInfo(moons) {
    // Could add moon phase info to Seasons & Stars display
    // This would be implementation-specific to Seasons & Stars UI
  }

  /**
   * Enable/disable synchronization
   */
  setSyncEnabled(enabled) {
    this.syncEnabled = enabled;
  }

  /**
   * Enable/disable enhancements
   */
  setEnhancementsEnabled(enabled) {
    this.enhancementsEnabled = enabled;
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      seasonsStarsActive: !!game.modules.get("seasons-and-stars")?.active,
      apiAvailable: !!this.seasonsStarsAPI,
      syncEnabled: this.syncEnabled,
      enhancementsEnabled: this.enhancementsEnabled,
      calendarId: this.calendarId,
    };
  }

  /**
   * Debug information
   */
  debug() {
    const status = this.getStatus();
    const currentDSDate = this.darkSunCalendar.getCurrentDate();
    const currentSSDate = this.seasonsStarsAPI?.getCurrentDate(this.calendarId);

    console.log("Dark Sun Calendar - Seasons & Stars Integration Debug:", {
      status,
      darkSunDate: {
        kingsAge: currentDSDate.kingsAge,
        year: currentDSDate.year,
        dayOfYear: currentDSDate.dayOfYear,
        yearName: currentDSDate.yearName,
        absoluteDay: currentDSDate.absoluteDay,
      },
      seasonsStarsDate: currentSSDate,
      moonPhases: {
        ral: `${currentDSDate.moons.ral.phaseName} (${currentDSDate.moons.ral.illumination}%)`,
        guthay: `${currentDSDate.moons.guthay.phaseName} (${currentDSDate.moons.guthay.illumination}%)`,
      },
      eclipse: currentDSDate.eclipse.type,
    });

    return status;
  }
}

// Export for different environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { SeasonsStarsIntegration };
} else {
  window.SeasonsStarsIntegration = SeasonsStarsIntegration;
}
