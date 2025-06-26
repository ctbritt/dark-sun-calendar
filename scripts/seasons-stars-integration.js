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
      console.log("Dark Sun Calendar: Seasons & Stars integration initialized");
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
      console.log("DSC: seasons-stars:dateChanged hook fired", data);
      if (this.syncEnabled && data.newDate) {
        const nd = data.newDate;
        console.log("DSC: onSeasonsStarsDateChange called with", {
          year: nd.year,
          month: nd.month,
          day: nd.day,
          intercalary: nd.intercalary,
          weekday: nd.weekday,
        });
        this.onSeasonsStarsDateChange(data.newDate);
      }
    });

    // Listen for calendar changes
    Hooks.on("seasons-stars:calendarChanged", (data) => {
      if (data.calendarId === this.calendarId) {
        console.log(
          "Dark Sun Calendar: Seasons & Stars switched to Dark Sun calendar"
        );
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

      // Calculate King's Age and year within age using new epoch
      const kingsAge = Math.floor((year - 1) / 77) + 190;
      const yearInAge = ((year - 1) % 77) + 1;

      // Calculate day of year from month and day
      const dayOfYear = this.calculateDayOfYear(month, day);

      // Guard: If current DSC date is intercalary and incoming SaS date is not, ignore update
      const dscCurrent = this.darkSunCalendar.getCurrentDate();
      const isDSCIntercalary =
        dscCurrent.intercalary !== null && dscCurrent.intercalary !== undefined;
      // SaS never sends intercalary, so if month is defined, it's not intercalary
      const isSaSIntercalary = false;
      if (isDSCIntercalary && !isSaSIntercalary) {
        console.warn(
          "SaS tried to overwrite an intercalary day with a non-intercalary date. Ignoring."
        );
        return;
      }

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
   * Sync Dark Sun Calendar to Seasons & Stars
   */
  async syncToSeasonsStars() {
    if (!this.seasonsStarsAPI || !this.syncEnabled) return;

    try {
      const currentDate = this.darkSunCalendar.getCurrentDate();

      // Convert to Seasons & Stars format
      const seasonsStarsDate = this.convertToSeasonsStarsFormat(currentDate);

      // Update Seasons & Stars
      await this.seasonsStarsAPI.setCurrentDate(seasonsStarsDate);
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
    // Use new epoch: Y1 in S&S = KA 190, Y1 in Dark Sun
    const totalYears = (darkSunDate.kingsAge - 190) * 77 + darkSunDate.year;

    let month = 1;
    let day = 1;

    if (darkSunDate.month) {
      month = darkSunDate.month;
      day = darkSunDate.dayInMonth;
    }

    return {
      year: totalYears,
      month: month,
      day: day,
      // Add any additional Seasons & Stars specific properties
      calendarId: this.calendarId,
    };
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

      console.log(
        "Dark Sun Calendar: Enhanced Seasons & Stars with astronomical data"
      );
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
    console.log(
      `Dark Sun Calendar: Seasons & Stars sync ${
        enabled ? "enabled" : "disabled"
      }`
    );
  }

  /**
   * Enable/disable enhancements
   */
  setEnhancementsEnabled(enabled) {
    this.enhancementsEnabled = enabled;
    console.log(
      `Dark Sun Calendar: Seasons & Stars enhancements ${
        enabled ? "enabled" : "disabled"
      }`
    );
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
