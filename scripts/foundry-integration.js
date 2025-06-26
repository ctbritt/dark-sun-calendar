console.log("foundry-integration.js loaded");

/**
 * FoundryVTT Integration for Dark Sun Calendar
 * ===========================================
 * Provides FoundryVTT-specific integration, chat commands, and UI hooks
 */

/**
 * FoundryVTT Integration Class
 */
class FoundryDarkSunCalendar {
  constructor() {
    this.calendar = null;
    this.settings = {};
    this.ui = null;
    this.initialized = false;
    this.seasonsStarsIntegration = null;
    this._calendarApp = null;
  }

  /**
   * Initialize the FoundryVTT integration
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize the core calendar (now async)
      this.calendar = await initializeDarkSunCalendar();

      // Load settings
      await this.loadSettings();

      // Set up hooks
      this.setupHooks();

      // Register chat commands
      this.registerChatCommands();

      // Setup UI integration
      this.setupUI();

      // Initialize Seasons & Stars integration
      await this.initializeSeasonsStarsIntegration();

      this.initialized = true;
      console.log("FoundryVTT Dark Sun Calendar integration initialized");
    } catch (error) {
      console.error("Failed to initialize FoundryVTT integration:", error);
      throw error;
    }
  }

  /**
   * Load module settings
   */
  async loadSettings() {
    // Register module settings
    game.settings.register("dark-sun-calendar", "kingsAge", {
      name: "Current King's Age",
      hint: "The current King's Age number in the Athasian calendar",
      scope: "world",
      config: true,
      type: Number,
      default: 190,
      range: { min: 1, max: 1000, step: 1 },
      onChange: (value) => {
        let kingsAge = game.settings.get("dark-sun-calendar", "kingsAge");
        if (typeof kingsAge !== "number" || kingsAge < 1) {
          kingsAge = 190;
          game.settings.set("dark-sun-calendar", "kingsAge", 190);
        }
        let yearInAge = game.settings.get("dark-sun-calendar", "yearInAge");
        if (typeof yearInAge !== "number" || yearInAge < 1 || yearInAge > 77) {
          yearInAge = 1;
          game.settings.set("dark-sun-calendar", "yearInAge", 1);
        }
        let dayOfYear = game.settings.get("dark-sun-calendar", "dayOfYear");
        if (typeof dayOfYear !== "number" || dayOfYear < 1 || dayOfYear > 375) {
          dayOfYear = 1;
          game.settings.set("dark-sun-calendar", "dayOfYear", 1);
        }
        this.settings.kingsAge = kingsAge;
        this.settings.yearInAge = yearInAge;
        this.settings.dayOfYear = dayOfYear;
        this.updateDate();
      },
    });

    game.settings.register("dark-sun-calendar", "yearInAge", {
      name: "Current Year in Age",
      hint: "The current year within the King's Age (1-77)",
      scope: "world",
      config: true,
      type: Number,
      default: 26,
      range: { min: 1, max: 77, step: 1 },
      onChange: (value) => {
        let kingsAge = game.settings.get("dark-sun-calendar", "kingsAge");
        if (typeof kingsAge !== "number" || kingsAge < 1) {
          kingsAge = 190;
          game.settings.set("dark-sun-calendar", "kingsAge", 190);
        }
        let yearInAge = game.settings.get("dark-sun-calendar", "yearInAge");
        if (typeof yearInAge !== "number" || yearInAge < 1 || yearInAge > 77) {
          yearInAge = 26;
          game.settings.set("dark-sun-calendar", "yearInAge", 26);
        }
        let dayOfYear = game.settings.get("dark-sun-calendar", "dayOfYear");
        if (typeof dayOfYear !== "number" || dayOfYear < 1 || dayOfYear > 375) {
          dayOfYear = 1;
          game.settings.set("dark-sun-calendar", "dayOfYear", 1);
        }
        this.settings.kingsAge = kingsAge;
        this.settings.yearInAge = yearInAge;
        this.settings.dayOfYear = dayOfYear;
        this.updateDate();
      },
    });

    game.settings.register("dark-sun-calendar", "dayOfYear", {
      name: "Current Day of Year",
      hint: "The current day within the year (1-375)",
      scope: "world",
      config: true,
      type: Number,
      default: 1,
      range: { min: 1, max: 375, step: 1 },
      onChange: (value) => {
        let kingsAge = game.settings.get("dark-sun-calendar", "kingsAge");
        if (typeof kingsAge !== "number" || kingsAge < 1) {
          kingsAge = 190;
          game.settings.set("dark-sun-calendar", "kingsAge", 190);
        }
        let yearInAge = game.settings.get("dark-sun-calendar", "yearInAge");
        if (typeof yearInAge !== "number" || yearInAge < 1 || yearInAge > 77) {
          yearInAge = 26;
          game.settings.set("dark-sun-calendar", "yearInAge", 26);
        }
        let dayOfYear = game.settings.get("dark-sun-calendar", "dayOfYear");
        if (typeof dayOfYear !== "number" || dayOfYear < 1 || dayOfYear > 375) {
          dayOfYear = 1;
          game.settings.set("dark-sun-calendar", "dayOfYear", 1);
        }
        this.settings.kingsAge = kingsAge;
        this.settings.yearInAge = yearInAge;
        this.settings.dayOfYear = dayOfYear;
        this.updateDate();
      },
    });

    game.settings.register("dark-sun-calendar", "timeSync", {
      name: "Enable Time Synchronization",
      hint:
        "Automatically advance the Dark Sun calendar when FoundryVTT world time advances",
      scope: "world",
      config: true,
      type: Boolean,
      default: false,
    });

    game.settings.register("dark-sun-calendar", "showEclipses", {
      name: "Show Eclipse Notifications",
      hint: "Display chat notifications for eclipses and astronomical events",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register("dark-sun-calendar", "seasonsStarsSync", {
      name: "Seasons & Stars Synchronization",
      hint: "Automatically sync with Seasons & Stars module if available",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register("dark-sun-calendar", "seasonsStarsEnhancements", {
      name: "Enhance Seasons & Stars",
      hint: "Add astronomical data and moon phases to Seasons & Stars",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });

    game.settings.register("dark-sun-calendar", "allowPlayerAccess", {
      name: "Allow Player Access",
      hint: "Allow players to view the calendar (GMs can always advance time)",
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
    });

    // Load current settings
    this.settings = {
      kingsAge: game.settings.get("dark-sun-calendar", "kingsAge"),
      yearInAge: game.settings.get("dark-sun-calendar", "yearInAge"),
      dayOfYear: game.settings.get("dark-sun-calendar", "dayOfYear"),
      timeSync: game.settings.get("dark-sun-calendar", "timeSync"),
      showEclipses: game.settings.get("dark-sun-calendar", "showEclipses"),
      seasonsStarsSync: game.settings.get(
        "dark-sun-calendar",
        "seasonsStarsSync"
      ),
      seasonsStarsEnhancements: game.settings.get(
        "dark-sun-calendar",
        "seasonsStarsEnhancements"
      ),
      allowPlayerAccess: game.settings.get(
        "dark-sun-calendar",
        "allowPlayerAccess"
      ),
    };

    // Validate settings
    if (
      typeof this.settings.kingsAge !== "number" ||
      this.settings.kingsAge < 1
    ) {
      this.settings.kingsAge = 190;
      game.settings.set("dark-sun-calendar", "kingsAge", 190);
    }
    if (
      typeof this.settings.yearInAge !== "number" ||
      this.settings.yearInAge < 1 ||
      this.settings.yearInAge > 77
    ) {
      this.settings.yearInAge = 26;
      game.settings.set("dark-sun-calendar", "yearInAge", 26);
    }
    if (
      typeof this.settings.dayOfYear !== "number" ||
      this.settings.dayOfYear < 1 ||
      this.settings.dayOfYear > 375
    ) {
      this.settings.dayOfYear = 1;
      game.settings.set("dark-sun-calendar", "dayOfYear", 1);
    }

    // Update calendar with current settings
    this.updateDate();
  }

  /**
   * Update calendar date from settings
   */
  updateDate() {
    if (!this.calendar) return;

    // Only update if settings differ from calendar state
    const current = this.calendar.getCurrentDate();
    if (
      this.settings.kingsAge === current.kingsAge &&
      this.settings.yearInAge === current.yearInAge &&
      this.settings.dayOfYear === current.dayOfYear
    ) {
      return; // No change needed
    }

    // Ensure the calendar's internal state matches the settings
    this.calendar.setDate(
      this.settings.kingsAge,
      this.settings.yearInAge,
      this.settings.dayOfYear
    );

    // Verify the calendar state matches what we set
    const updated = this.calendar.getCurrentDate();
    if (updated.kingsAge !== this.settings.kingsAge) {
      console.warn(
        `Dark Sun Calendar: Kings Age mismatch. Settings: ${this.settings.kingsAge}, Calendar: ${updated.kingsAge}. Correcting...`
      );
      this.calendar.setDate(
        this.settings.kingsAge,
        this.settings.yearInAge,
        this.settings.dayOfYear
      );
    }
  }

  /**
   * Setup FoundryVTT hooks
   */
  setupHooks() {
    // Hook into world time changes
    Hooks.on("updateWorldTime", (worldTime, dt) => {
      if (this.settings.timeSync) {
        // Convert world time change to Athasian days
        const daysAdvanced = Math.floor(dt / (24 * 60 * 60 * 1000)); // Assuming dt is in milliseconds
        if (daysAdvanced > 0) {
          // Call the global API directly to avoid circular calls
          globalThis.DSC.advanceDays(daysAdvanced);
        }
      }
    });

    // Hook into ready event
    Hooks.once("ready", () => {
      this.onReady();
    });

    // Hook into render sidebar
    Hooks.on("renderSidebar", () => {
      this.addTokenControls();
    });
  }

  /**
   * Actions to perform when Foundry is ready
   */
  onReady() {
    // Validate loaded settings to prevent RangeErrors
    const validateAndCorrectSettings = async () => {
      let changed = false;
      if (
        typeof this.settings.kingsAge !== "number" ||
        this.settings.kingsAge < 1
      ) {
        this.settings.kingsAge = 190;
        await game.settings.set("dark-sun-calendar", "kingsAge", 190);
        changed = true;
      }
      if (
        typeof this.settings.yearInAge !== "number" ||
        this.settings.yearInAge < 1 ||
        this.settings.yearInAge > 77
      ) {
        this.settings.yearInAge = 26;
        await game.settings.set("dark-sun-calendar", "yearInAge", 26);
        changed = true;
      }
      if (
        typeof this.settings.dayOfYear !== "number" ||
        this.settings.dayOfYear < 1 ||
        this.settings.dayOfYear > 375
      ) {
        this.settings.dayOfYear = 1;
        await game.settings.set("dark-sun-calendar", "dayOfYear", 1);
        changed = true;
      }
      if (changed) {
        this.updateDate();
      }
    };
    validateAndCorrectSettings();

    // Check for eclipses on startup
    if (this.settings.showEclipses) {
      this.checkForEclipses();
    }

    // Setup global API
    this.setupGlobalAPI();
  }

  /**
   * Setup global API for macros
   */
  setupGlobalAPI() {
    globalThis.DSC = {
      // Current date functions
      getCurrentDate: () => this.calendar.getCurrentDate(),

      // Date setting functions
      setAbsoluteYear: async (year) => {
        await game.settings.set("dark-sun-calendar", "absoluteYear", year);
        this.settings.absoluteYear = year;
        this.updateDate();
      },

      setDayOfYear: async (day) => {
        await game.settings.set("dark-sun-calendar", "dayOfYear", day);
        this.settings.dayOfYear = day;
        this.updateDate();
      },

      setDateByMonthAndDay: async (monthName, day) => {
        this.calendar.setDateByMonthAndDay(monthName, day);
        const currentDate = this.calendar.getCurrentDate();
        await game.settings.set(
          "dark-sun-calendar",
          "dayOfYear",
          currentDate.dayOfYear
        );
        this.settings.dayOfYear = currentDate.dayOfYear;
      },

      // Time advancement
      advanceDays: async (days) => {
        // Advance the calendar
        this.calendar.advanceDays(days);
        const currentDate = this.calendar.getCurrentDate();

        // Update all settings from the new calendar state
        await game.settings.set(
          "dark-sun-calendar",
          "kingsAge",
          currentDate.kingsAge
        );
        await game.settings.set(
          "dark-sun-calendar",
          "yearInAge",
          currentDate.yearInAge
        );
        await game.settings.set(
          "dark-sun-calendar",
          "dayOfYear",
          currentDate.dayOfYear
        );

        // Update internal settings
        this.settings.kingsAge = currentDate.kingsAge;
        this.settings.yearInAge = currentDate.yearInAge;
        this.settings.dayOfYear = currentDate.dayOfYear;

        // Update the calendar's internal state to match the new date
        this.calendar.setDate(
          currentDate.kingsAge,
          currentDate.yearInAge,
          currentDate.dayOfYear
        );

        // Sync to Seasons & Stars if integration is enabled
        if (this.seasonsStarsIntegration && this.settings.seasonsStarsSync) {
          await this.seasonsStarsIntegration.syncToSeasonsStars(currentDate);
        }

        // Check for eclipses after advancement
        if (this.settings.showEclipses) {
          this.checkForEclipses();
        }

        // Refresh UI
        this.refreshUI();
      },

      // Utility functions
      getNextEclipse: () => this.calendar.getNextEclipse(),
      getYearlyEclipses: () => this.calendar.getYearlyEclipses(),
      forceRerender: () => this.refreshUI(),
      debugSS: () => this.debugSeasonsAndStars(),

      // Seasons & Stars integration
      syncFromSS: async () => {
        if (this.seasonsStarsIntegration) {
          await this.seasonsStarsIntegration.syncFromSeasonsStars();
        }
      },

      syncToSS: async () => {
        if (this.seasonsStarsIntegration) {
          await this.seasonsStarsIntegration.syncToSeasonsStars();
        }
      },

      setSSSyncEnabled: (enabled) => {
        if (this.seasonsStarsIntegration) {
          this.seasonsStarsIntegration.setSyncEnabled(enabled);
        }
      },

      setSSEnhancementsEnabled: (enabled) => {
        if (this.seasonsStarsIntegration) {
          this.seasonsStarsIntegration.setEnhancementsEnabled(enabled);
        }
      },

      getSSStatus: () => {
        return this.seasonsStarsIntegration
          ? this.seasonsStarsIntegration.getStatus()
          : { available: false };
      },

      // Diagnostic functions
      getDiagnostics: () => this.calendar.getDiagnostics(),
      validateSystem: () => this.calendar.validateSystem(),
    };
  }

  /**
   * Register chat commands using proper FoundryVTT v13 method
   */
  registerChatCommands() {
    // Hook into chat message creation to intercept our commands
    Hooks.on("chatMessage", (log, message, data) => {
      if (message.startsWith("/darksun")) {
        const args = message.split(" ");
        const command = args[1]?.toLowerCase();
        const params = args.slice(2);

        this.handleChatCommand(command, params);
        return false; // Prevent default chat processing
      }
    });

    console.log(
      "Dark Sun Calendar: Chat commands registered (/darksun date, /darksun moons, /darksun advance)"
    );
  }

  /**
   * Handle Dark Sun chat commands
   */
  handleChatCommand(command, params) {
    switch (command) {
      case "date":
        this.chatCommand("date");
        break;
      case "moons":
      case "moon":
        this.chatCommand("moons");
        break;
      case "advance":
        const days = parseInt(params[0]) || 1;
        this.chatCommand("advance", [days]);
        break;
      case "help":
        this.showChatHelp();
        break;
      default:
        this.showChatHelp();
        break;
    }
  }

  /**
   * Show chat command help
   */
  showChatHelp() {
    this.sendChatMessage(`
            <div class="dark-sun-chat">
                <h3>Dark Sun Calendar Commands</h3>
                <p><strong>/darksun date</strong> - Show current Athasian date</p>
                <p><strong>/darksun moons</strong> - Display current moon phases</p>
                <p><strong>/darksun advance [days]</strong> - Advance calendar by number of days</p>
                <p><strong>/darksun help</strong> - Show this help message</p>
            </div>
        `);
  }

  /**
   * Handle chat commands
   */
  async chatCommand(command, args = []) {
    const currentDate = this.calendar.getCurrentDate();

    switch (command) {
      case "date":
        this.sendChatMessage(`
                    <div class="dark-sun-chat">
                        <h3>Current Athasian Date</h3>
                        <p><strong>Kings Age:</strong> ${currentDate.kingsAge}</p>
                        <p><strong>Year in Age:</strong> ${currentDate.yearInAge}</p>
                        <p><strong>Day of Year:</strong> ${currentDate.dayOfYear}</p>
                    </div>
                `);
        break;
      case "moons":
        this.chatCommand("moons");
        break;
      case "advance":
        const days = parseInt(args[0]) || 1;
        this.chatCommand("advance", [days]);
        break;
      default:
        this.showChatHelp();
        break;
    }
  }

  /**
   * Send a chat message to the chat log
   */
  sendChatMessage(message) {
    ChatLog.post({
      content: message,
      type: CONST.CHAT_MESSAGE_TYPES.OOC,
    });
  }

  /**
   * Setup UI integration
   */
  setupUI() {
    this.addTokenControls();
  }

  /**
   * Add notes controls for calendar access
   */
  addTokenControls() {
    // Add calendar button to notes controls (Foundry v13: controls is an object, tools is an object)
    Hooks.on("getSceneControlButtons", (controls) => {
      if (
        !game.user.isGM &&
        !game.settings.get("dark-sun-calendar", "allowPlayerAccess")
      ) {
        return; // Only allow if GM or player access is enabled
      }

      // Access the notes controls group directly (v13+)
      const notesControls = controls.notes;
      if (notesControls && typeof notesControls.tools === "object") {
        notesControls.tools["dark-sun-calendar"] = {
          name: "dark-sun-calendar",
          title: "Dark Sun Calendar",
          icon: "fa-solid fa-sun",
          button: true,
          onClick: async () => {
            // Check if the class is available
            if (!window.DarkSunCalendarApp) {
              console.log("DarkSunCalendarApp class not found, loading it...");
              try {
                // Try to load the class dynamically
                await import("./dark-sun-calendar-app.js");
                console.log("DarkSunCalendarApp loaded successfully");
              } catch (error) {
                console.error("Failed to load DarkSunCalendarApp:", error);
                ui.notifications.error("Failed to load calendar interface");
                return;
              }
            }
            // Open the v2 Application
            try {
              if (!this._calendarApp || this._calendarApp._state < 1) {
                this._calendarApp = new window.DarkSunCalendarApp(this);
              }
              this._calendarApp.render(true);
            } catch (error) {
              console.error("Failed to create or render calendar app:", error);
              ui.notifications.error("Failed to open calendar");
            }
          },
        };
      } else {
        console.warn(
          "Dark Sun Calendar: Notes controls not found in expected structure:",
          controls
        );
      }
    });
  }

  /**
   * Initialize Seasons & Stars integration
   */
  async initializeSeasonsStarsIntegration() {
    if (
      !this.settings.seasonsStarsSync &&
      !this.settings.seasonsStarsEnhancements
    ) {
      console.log(
        "Dark Sun Calendar: Seasons & Stars integration disabled in settings"
      );
      return;
    }

    try {
      // Check if Seasons & Stars is available
      const seasonsStarsModule = game.modules.get("seasons-and-stars");
      if (!seasonsStarsModule?.active) {
        console.log(
          "Dark Sun Calendar: Seasons & Stars module not active, running in standalone mode"
        );
        return;
      }

      // Initialize integration
      this.seasonsStarsIntegration = new window.SeasonsStarsIntegration(
        this.calendar
      );

      // Configure integration based on settings
      this.seasonsStarsIntegration.setSyncEnabled(
        this.settings.seasonsStarsSync
      );
      this.seasonsStarsIntegration.setEnhancementsEnabled(
        this.settings.seasonsStarsEnhancements
      );

      console.log("Dark Sun Calendar: Seasons & Stars integration configured");
    } catch (error) {
      console.error(
        "Dark Sun Calendar: Failed to initialize Seasons & Stars integration:",
        error
      );
    }
  }

  /**
   * Refresh UI elements
   */
  refreshUI() {
    // Force refresh of any open calendar windows
    if (this._calendarApp && this._calendarApp.rendered) {
      this._calendarApp.render(true);
    }
  }

  /**
   * Debug Seasons & Stars integration
   */
  debugSeasonsAndStars() {
    if (this.seasonsStarsIntegration) {
      return this.seasonsStarsIntegration.debug();
    } else {
      const hasSeasonStars = game.modules.get("seasons-and-stars")?.active;
      console.log("Seasons & Stars Debug:", {
        moduleActive: hasSeasonStars,
        integrationAvailable: false,
        currentDate: this.calendar.getCurrentDate(),
        settings: this.settings,
      });
      if (hasSeasonStars) {
        console.log(
          "Seasons & Stars integration available but not initialized"
        );
      } else {
        console.log("Seasons & Stars not active - running in standalone mode");
      }
    }
  }

  /**
   * Check for eclipses and notify
   */
  checkForEclipses() {
    const currentDate = this.calendar.getCurrentDate();
    if (currentDate.eclipse && currentDate.eclipse.type !== "none") {
      this.sendChatMessage(`
        <div class="dark-sun-chat eclipse-notification">
          <h3>🌙 Eclipse Event 🌙</h3>
          <p><strong>Type:</strong> ${
            currentDate.eclipse.type.charAt(0).toUpperCase() +
            currentDate.eclipse.type.slice(1)
          } Eclipse</p>
          <p><strong>Description:</strong> ${
            currentDate.eclipse.description
          }</p>
          <p><strong>Duration:</strong> ${
            currentDate.eclipse.duration
          } hours</p>
        </div>
      `);
    }
  }
}

// Ensure the class is available globally
window.FoundryDarkSunCalendar = FoundryDarkSunCalendar;

// Expose DSC API globally for console debugging
window.DSC = globalThis.DSC = {
  getCurrentDate: () =>
    window.foundryDarkSunCalendar?.calendar?.getCurrentDate?.(),
  calendar: () => window.foundryDarkSunCalendar?.calendar,
  debug: () => window.foundryDarkSunCalendar,
};

// Properly register the module with FoundryVTT
Hooks.once("init", async () => {
  console.log("Hooks.once('init') fired");
  globalThis.foundryDarkSunCalendar = new FoundryDarkSunCalendar();
  console.log("FoundryDarkSunCalendar instance created");
  await globalThis.foundryDarkSunCalendar.initialize();
  console.log("FoundryDarkSunCalendar.initialize() complete");
});
