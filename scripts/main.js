/**
 * Dark Sun Calendar - Main Module Entry Point
 * A smart layer that integrates with Seasons & Stars to provide Dark Sun lore and functionality
 */


// Global module instance
let darkSunCalendar;

/**
 * Main Dark Sun Calendar class
 */
class DarkSunCalendar {
    constructor() {
        this.isReady = false;
        this.seasonsStars = null;
    }

    /**
     * Initialize the module
     */
    async initialize() {
        
        // Check if Seasons & Stars is loaded
        if (!game.seasonsStars?.api) {
            console.error('🌞 Dark Sun Calendar | ERROR: Seasons & Stars is not loaded! This module requires Seasons & Stars to function.');
            ui.notifications?.error('Dark Sun Calendar requires Seasons & Stars to be loaded and enabled.');
            throw new Error('Seasons & Stars is not loaded');
        }
        
        this.seasonsStars = game.seasonsStars;
        
        // Load our own Dark Sun calendar configuration
        console.log('🌞 Dark Sun Calendar | Loading local dark-sun.json configuration...');
        await this.loadDarkSunCalendar();
        
        // Check if Dark Sun calendar is now available
        const activeCalendar = this.getActiveCalendar();
        if (!activeCalendar) {
            console.error('🌞 Dark Sun Calendar | ERROR: No active calendar found in Seasons & Stars!');
            ui.notifications?.error('Dark Sun Calendar requires an active calendar in Seasons & Stars.');
            throw new Error('No active calendar found in Seasons & Stars');
        }
        
        // Ensure Dark Sun calendar is active
        if (activeCalendar.id !== 'dark-sun') {
            console.log('🌞 Dark Sun Calendar | Setting Dark Sun as active calendar...');
            try {
                await this.seasonsStars.manager.setActiveCalendar('dark-sun');
                console.log('🌞 Dark Sun Calendar | Successfully set Dark Sun as active calendar');
            } catch (error) {
                console.error('🌞 Dark Sun Calendar | ERROR: Failed to set Dark Sun as active calendar:', error);
                ui.notifications?.error('Failed to activate Dark Sun calendar in Seasons & Stars.');
                throw new Error(`Failed to activate Dark Sun calendar: ${error.message}`);
            }
        }
        
        // Verify which Dark Sun configuration is being used
        const finalActiveCalendar = this.getActiveCalendar();
        if (finalActiveCalendar && finalActiveCalendar.year && finalActiveCalendar.year.currentYear) {
            console.log(`🌞 Dark Sun Calendar | Using calendar with currentYear: ${finalActiveCalendar.year.currentYear}`);
            if (finalActiveCalendar.year.currentYear === 14579) {
                console.log('🌞 Dark Sun Calendar | ✅ Confirmed using local dark-sun.json configuration');
            } else if (finalActiveCalendar.year.currentYear === 102) {
                console.log('🌞 Dark Sun Calendar | ✅ Confirmed using Seasons & Stars built-in Dark Sun calendar');
            } else {
                console.warn(`🌞 Dark Sun Calendar | ⚠️ Unexpected calendar currentYear: ${finalActiveCalendar.year.currentYear}`);
                console.warn('🌞 Dark Sun Calendar | Expected 14579 (local) or 102 (S&S built-in)');
            }
        }
        
        // Initialize Athasian Moon System
        await this.initializeMoonSystem();
        
        // Setup integration
        this.setupIntegration();
        
        this.isReady = true;
        
        // Fire ready hook
        Hooks.callAll('dark-sun-calendar:ready', {
            api: this.getAPI()
        });
    }

    /**
     * Load the Dark Sun calendar from our local JSON file, with fallback to S&S built-in
     */
    async loadDarkSunCalendar() {
        try {
            // Try to load the dark-sun.json file from our module's calendar directory
            console.log('🌞 Dark Sun Calendar | Attempting to load local dark-sun.json configuration...');
            const response = await fetch('modules/dark-sun-calendar/calendar/dark-sun.json');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const calendarData = await response.json();
            console.log('🌞 Dark Sun Calendar | Successfully loaded local dark-sun.json');
            
            // Register the calendar with Seasons & Stars CalendarManager
            const success = this.seasonsStars.manager.loadCalendar(calendarData);
            if (!success) {
                throw new Error('Failed to register local calendar with Seasons & Stars');
            }
            
            console.log('🌞 Dark Sun Calendar | ✅ Successfully registered local Dark Sun calendar with Seasons & Stars');
            ui.notifications?.info('Dark Sun Calendar loaded with local configuration');
            
        } catch (error) {
            console.warn('🌞 Dark Sun Calendar | ⚠️ Failed to load local dark-sun.json, falling back to S&S built-in:', error.message);
            
            // Fallback: Check if S&S already has a built-in Dark Sun calendar
            const existingCalendars = this.seasonsStars.manager.getAllCalendars();
            const existingDarkSun = existingCalendars.find(cal => cal.id === 'dark-sun');
            
            if (existingDarkSun) {
                console.log('🌞 Dark Sun Calendar | ✅ Using Seasons & Stars built-in Dark Sun calendar as fallback');
                ui.notifications?.info('Dark Sun Calendar loaded with Seasons & Stars built-in configuration');
            } else {
                // Last resort: S&S doesn't have Dark Sun calendar either
                console.error('🌞 Dark Sun Calendar | ERROR: No Dark Sun calendar found in local or S&S configurations');
                ui.notifications?.error('No Dark Sun calendar configuration found. Please check your installation.');
                throw new Error('No Dark Sun calendar configuration available');
            }
        }
    }

    /**
     * Initialize the Athasian Moon System
     */
    async initializeMoonSystem() {
        console.log('🌞 Dark Sun Calendar | Initializing Athasian Moon System...');
        
        try {
            // Ensure moon engine classes are available
            if (!window.AthasianMoonEngine) {
                throw new Error('AthasianMoonEngine not loaded');
            }
            if (!window.AthasianEclipseEngine) {
                throw new Error('AthasianEclipseEngine not loaded');
            }
            if (!window.AthasianCalendarCore) {
                throw new Error('AthasianCalendarCore not loaded');
            }
            
            // Initialize the moon system
            this.moonSystem = new window.AthasianMoonEngine.AthasianMoonSystem();
            
            // Initialize the eclipse calculator
            this.eclipseCalculator = new window.AthasianEclipseEngine.EclipseCalculator(this.moonSystem);
            
            // Test the systems
            if (!this.moonSystem.validateSystem()) {
                throw new Error('Moon system validation failed');
            }
            
            if (!this.eclipseCalculator.validateEclipseSystem()) {
                throw new Error('Eclipse system validation failed');
            }
            
            // Test date conversion
            if (!window.AthasianCalendarCore.testConversions()) {
                throw new Error('Date conversion system validation failed');
            }
            
            console.log('🌞 Dark Sun Calendar | ✅ Athasian Moon System initialized successfully');
            console.log(`🌞 Dark Sun Calendar | Eclipse cycle: ${this.moonSystem.eclipseCycle} days`);
            
            // Log current moon state for verification
            const currentAbsoluteDay = window.AthasianCalendarCore.getCurrentAbsoluteDay();
            const currentMoons = this.moonSystem.getBothMoons(currentAbsoluteDay);
            console.log(`🌞 Dark Sun Calendar | Current moons (Absolute Day ${currentAbsoluteDay}):`, {
                ral: `${currentMoons.ral.phaseName} (${currentMoons.ral.illumination}%)`,
                guthay: `${currentMoons.guthay.phaseName} (${currentMoons.guthay.illumination}%)`
            });
            
            const currentEclipse = this.eclipseCalculator.getEclipseInfo(currentAbsoluteDay);
            if (currentEclipse.type !== 'none') {
                console.log(`🌞 Dark Sun Calendar | Current eclipse:`, currentEclipse.description);
            }
            
        } catch (error) {
            console.error('🌞 Dark Sun Calendar | ERROR: Failed to initialize moon system:', error);
            ui.notifications?.error('Failed to initialize Dark Sun moon system.');
            
            // Set fallback null values
            this.moonSystem = null;
            this.eclipseCalculator = null;
            
            throw error;
        }
    }

    /**
     * Setup integration with Seasons & Stars
     */
    setupIntegration() {
        
        // Listen for date changes
        Hooks.on('seasons-stars:dateChanged', (data) => {
            this.onDateChanged(data);
        });
        
        // Listen for calendar changes
        Hooks.on('seasons-stars:calendarChanged', (data) => {
            this.onCalendarChanged(data);
        });
    }

    /**
     * Handle date changes from Seasons & Stars
     */
    onDateChanged(data) {
        if (!this.isReady) return;
        
        
        // Fire our own date change hook
        Hooks.callAll('dark-sun-calendar:dateChanged', {
            newDate: data.newDate
        });
    }

    /**
     * Handle calendar changes from Seasons & Stars
     */
    onCalendarChanged(data) {
        if (!this.isReady) return;
        
    }

    // ============================================================================
    // SEASONS & STARS API WRAPPERS
    // ============================================================================

    /**
     * Get current date with Dark Sun enhancements
     */
    getCurrentDate(...args) {
        // Check if we have a stored intercalary date
        if (this._lastIntercalaryDate && this._lastIntercalaryDate.isIntercalary) {
            console.log(`🌞 Dark Sun Calendar | Returning stored intercalary date:`, this._lastIntercalaryDate);
            
            // Get the active calendar with all extensions
            const activeCalendar = this.getActiveCalendar();
            if (!activeCalendar) {
                return null;
            }
            
            // Create date object from our stored intercalary date
            const dayOfYear = this._lastIntercalaryDate.dayOfYear;
            const year = this._lastIntercalaryDate.year;
            
            // Determine which intercalary period this is
            let intercalaryName, intercalaryDay, month;
            if (dayOfYear >= 121 && dayOfYear <= 125) {
                intercalaryName = "Cooling Sun";
                intercalaryDay = dayOfYear - 121 + 1;
                month = 4;
            } else if (dayOfYear >= 246 && dayOfYear <= 250) {
                intercalaryName = "Soaring Sun";
                intercalaryDay = dayOfYear - 246 + 1;
                month = 8;
            } else if (dayOfYear >= 371 && dayOfYear <= 375) {
                intercalaryName = "Highest Sun";
                intercalaryDay = dayOfYear - 371 + 1;
                month = 12;
            }
            
            const dateObject = {
                year: year,
                month: month,
                day: 1, // Placeholder for S&S compatibility
                weekday: 0,
                intercalary: intercalaryName,
                time: { hour: 0, minute: 0, second: 0 },
                dayOfYear: dayOfYear,
                kingsAge: this.getKingsAge(year),
                kingsAgeYear: this.getKingsAgeYear(year),
                yearName: this.getYearName(year),
                freeYear: this.getFreeYear(year),
                intercalaryDay: intercalaryDay
            };
            
            // Create and return a DSCalendarDate object with the full calendar
            return new DSCalendarDate(dateObject, activeCalendar);
        }
        
        // Regular date handling - get from Seasons & Stars
        const currentDate = this.seasonsStars.api.getCurrentDate(...args);
        if (!currentDate) {
            return null;
        }
        
        // Get the active calendar with all extensions
        const activeCalendar = this.getActiveCalendar();
        if (!activeCalendar) {
            return null;
        }
        
        // Convert CalendarDate to plain object if needed
        const dateObject = currentDate.toObject ? currentDate.toObject() : {
            year: currentDate.year,
            month: currentDate.month,
            day: currentDate.day,
            weekday: currentDate.weekday,
            intercalary: currentDate.intercalary,
            time: currentDate.time
        };
        
        // Add Dark Sun specific properties
        dateObject.dayOfYear = this.getDayOfYear(dateObject);
        dateObject.kingsAge = this.getKingsAge(dateObject.year);
        dateObject.kingsAgeYear = this.getKingsAgeYear(dateObject.year);
        dateObject.yearName = this.getYearName(dateObject.year);
        dateObject.freeYear = this.getFreeYear(dateObject.year);
        
        // Handle intercalary periods - calculate the specific day within the intercalary period
        if (dateObject.intercalary) {
            // For intercalary periods, we need to determine which day of the period it is
            // Since S&S always returns day 1 for intercalary periods, we need to calculate the actual day
            // For now, we'll assume it's day 1 of the intercalary period
            // TODO: We need a way to track which specific day of the intercalary period this is
            dateObject.intercalaryDay = 1;
            
            // Also update the dayOfYear to reflect the specific day within the intercalary period
            if (dateObject.intercalary === "Cooling Sun") {
                dateObject.dayOfYear = 121; // Start of Cooling Sun
            } else if (dateObject.intercalary === "Soaring Sun") {
                dateObject.dayOfYear = 246; // Start of Soaring Sun
            } else if (dateObject.intercalary === "Highest Sun") {
                dateObject.dayOfYear = 371; // Start of Highest Sun
            }
        }
        
        // Create and return a DSCalendarDate object with the full calendar
        return new DSCalendarDate(dateObject, activeCalendar);
    }

    /**
     * Set current date
     */
    setCurrentDate(...args) {
        return this.seasonsStars.api.setCurrentDate(...args);
    }

    /**
     * Advance time by days
     */
    advanceDays(...args) {
        return this.seasonsStars.api.advanceDays(...args);
    }

    /**
     * Advance time by hours
     */
    advanceHours(...args) {
        return this.seasonsStars.api.advanceHours(...args);
    }

    /**
     * Advance time by minutes
     */
    advanceMinutes(...args) {
        return this.seasonsStars.api.advanceMinutes(...args);
    }

    /**
     * Advance time by weeks
     */
    advanceWeeks(...args) {
        return this.seasonsStars.api.advanceWeeks(...args);
    }

    /**
     * Advance time by months
     */
    advanceMonths(...args) {
        return this.seasonsStars.api.advanceMonths(...args);
    }

    /**
     * Advance time by years
     */
    advanceYears(...args) {
        return this.seasonsStars.api.advanceYears(...args);
    }

    /**
     * Get active calendar
     */
    getActiveCalendar(...args) {
        return this.seasonsStars.api.getActiveCalendar(...args);
    }

    /**
     * Get available calendars
     */
    getAvailableCalendars(...args) {
        return this.seasonsStars.api.getAvailableCalendars(...args);
    }

    /**
     * Get month names
     */
    getMonthNames(...args) {
        return this.seasonsStars.api.getMonthNames(...args);
    }

    /**
     * Get weekday names
     */
    getWeekdayNames(...args) {
        return this.seasonsStars.api.getWeekdayNames(...args);
    }

    /**
     * Get season info for Dark Sun calendar
     * Uses the seasons defined in calendar.extensions["seasons-and-stars"].seasons
     */
    getSeasonInfo(date, calendarId) {
        // If no date is specified, use current date
        if (!date) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                return null;
            }
            // Return the season info directly from the DSCalendarDate object
            return currentDate.getSeason();
        }
        
        // Get the date object
        let dateObject = date;
        if (date && typeof date === 'object' && date.toObject && typeof date.toObject === 'function') {
            dateObject = date.toObject();
        } else if (date && typeof date === 'object') {
            dateObject = date;
        } else {
            // If invalid date provided, use current date
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                return null;
            }
            dateObject = currentDate.toObject();
        }
        
        // Validate date object
        if (!dateObject || typeof dateObject.year !== 'number' || typeof dateObject.month !== 'number' || typeof dateObject.day !== 'number') {
            return null;
        }
        
        try {
            // Get the active calendar
            const activeCalendar = this.getActiveCalendar(calendarId);
            if (!activeCalendar) {
                return null;
            }
            
            // Get the seasons configuration
            const seasonsConfig = activeCalendar.extensions?.["seasons-and-stars"]?.seasons;
            if (!seasonsConfig || !Array.isArray(seasonsConfig)) {
                return null;
            }
            
            // Calculate day of year for the given date
            const dayOfYear = this.getDayOfYear(dateObject);
            
            // Find the season that contains this day
            let currentSeason = null;
            let daysInSeason = 0;
            
            for (const season of seasonsConfig) {
                if (!season.startDay || !season.endDay) {
                    continue;
                }
                
                // Check if the day falls within this season
                if (dayOfYear >= season.startDay && dayOfYear <= season.endDay) {
                    currentSeason = season;
                    daysInSeason = season.endDay - season.startDay + 1;
                    break;
                }
            }
            
            if (!currentSeason) {
                return null;
            }
            
            // Calculate days into the season
            const daysIntoSeason = dayOfYear - currentSeason.startDay + 1;
            
            // Calculate days remaining in the season
            const daysRemaining = currentSeason.endDay - dayOfYear;
            
            const seasonInfo = {
                name: currentSeason.name,
                description: currentSeason.description || '',
                startDay: currentSeason.startDay,
                endDay: currentSeason.endDay,
                daysInSeason: daysInSeason,
                daysIntoSeason: daysIntoSeason,
                daysRemaining: daysRemaining,
                dayOfYear: dayOfYear,
                date: dateObject
            };
            
            return seasonInfo;
            
        } catch (error) {
            return null;
        }
    }

    /**
     * Format date
     */
    formatDate(...args) {
        return this.seasonsStars.api.formatDate(...args);
    }

    /**
     * Convert world time to date
     */
    worldTimeToDate(...args) {
        return this.seasonsStars.api.worldTimeToDate(...args);
    }

    /**
     * Convert date to world time
     */
    dateToWorldTime(...args) {
        return this.seasonsStars.api.dateToWorldTime(...args);
    }

    // ============================================================================
    // DARK SUN SPECIFIC METHODS
    // ============================================================================

    /**
     * Get moon phase information for a specific date
     * Uses the AthasianMoonSystem for precise astronomical calculations
     * @param {Object} date - Date object (optional, uses current date if not provided)
     * @param {string} moonName - Specific moon name (optional, returns all moons if not provided)
     * @returns {Array} Array of moon phase objects with detailed information
     */
    getMoonPhaseInfo(date, moonName) {
        try {
            if (!this.moonSystem) {
                console.warn('🌞 Dark Sun Calendar | getMoonPhaseInfo: Moon system not initialized');
                return [];
            }

            // If no date specified, use current date
            let targetDate = date;
            if (!targetDate) {
                targetDate = this.getCurrentDate();
                if (!targetDate) {
                    console.warn('🌞 Dark Sun Calendar | getMoonPhaseInfo: Could not get current date');
                    return [];
                }
            }

            // Convert to absolute days
            const absoluteDay = window.AthasianCalendarCore.dateToAbsoluteDays(targetDate);
            
            // Get moon data from our system
            const moonData = this.moonSystem.getBothMoons(absoluteDay);
            
            // Format as array for compatibility
            const moonPhaseInfo = [
                {
                    moonName: moonData.ral.name,
                    phaseName: moonData.ral.phaseName,
                    phaseIcon: this.convertPhaseNameToIcon(moonData.ral.phaseName),
                    moonColor: '#8de715', // Ral's green color
                    cycleLength: moonData.ral.period,
                    illumination: moonData.ral.illumination,
                    rise: moonData.ral.rise,
                    set: moonData.ral.set,
                    riseFormatted: moonData.ral.riseFormatted,
                    setFormatted: moonData.ral.setFormatted,
                    // Legacy compatibility fields
                    dayInPhase: Math.floor(moonData.ral.phase * moonData.ral.period),
                    daysUntilNext: moonData.ral.period - Math.floor(moonData.ral.phase * moonData.ral.period),
                    phase: moonData.ral.phase,
                    description: 'The smaller, green-yellow moon of Athas, companion to Guthay in the hostile sky'
                },
                {
                    moonName: moonData.guthay.name,
                    phaseName: moonData.guthay.phaseName,
                    phaseIcon: this.convertPhaseNameToIcon(moonData.guthay.phaseName),
                    moonColor: '#ffd700', // Guthay's golden color
                    cycleLength: moonData.guthay.period,
                    illumination: moonData.guthay.illumination,
                    rise: moonData.guthay.rise,
                    set: moonData.guthay.set,
                    riseFormatted: moonData.guthay.riseFormatted,
                    setFormatted: moonData.guthay.setFormatted,
                    // Legacy compatibility fields
                    dayInPhase: Math.floor(moonData.guthay.phase * moonData.guthay.period),
                    daysUntilNext: moonData.guthay.period - Math.floor(moonData.guthay.phase * moonData.guthay.period),
                    phase: moonData.guthay.phase,
                    description: 'The larger, golden moon of Athas, burning bright in the crimson sky'
                }
            ];

            // Filter by moon name if specified
            if (moonName) {
                return moonPhaseInfo.filter(info => 
                    info.moonName.toLowerCase() === moonName.toLowerCase()
                );
            }

            return moonPhaseInfo;

        } catch (error) {
            console.error('🌞 Dark Sun Calendar | getMoonPhaseInfo: Error calculating moon phases:', error);
            return [];
        }
    }

    /**
     * Convert phase name to icon for compatibility
     * @param {string} phaseName - Phase name from moon system
     * @returns {string} Icon name
     */
    convertPhaseNameToIcon(phaseName) {
        const phaseMap = {
            'Full': 'full',
            'Waning Gibbous': 'waning-gibbous',
            'Last Quarter': 'last-quarter',
            'Waning Crescent': 'waning-crescent',
            'New': 'new',
            'Waxing Crescent': 'waxing-crescent',
            'First Quarter': 'first-quarter',
            'Waxing Gibbous': 'waxing-gibbous'
        };
        
        return phaseMap[phaseName] || 'full';
    }

    /**
     * Get moon phase information for Ral specifically
     * @param {Object} date - Date object (optional, uses current date if not provided)
     * @returns {Object|null} Ral's moon phase information
     */
    getRalPhase(date) {
        const moonPhases = this.getMoonPhaseInfo(date, 'Ral');
        return moonPhases.length > 0 ? moonPhases[0] : null;
    }

    /**
     * Get moon phase information for Guthay specifically
     * @param {Object} date - Date object (optional, uses current date if not provided)
     * @returns {Object|null} Guthay's moon phase information
     */
    getGuthayPhase(date) {
        const moonPhases = this.getMoonPhaseInfo(date, 'Guthay');
        return moonPhases.length > 0 ? moonPhases[0] : null;
    }

    /**
     * Get current moon phases for all moons (Ral and Guthay)
     * @returns {Array} Array with current phase info for both moons
     */
    getCurrentMoonPhases() {
        return this.getMoonPhaseInfo();
    }

    /**
     * Format moon phase information for display
     * @param {Object} moonPhase - Moon phase object from getMoonPhaseInfo
     * @returns {string} Formatted moon phase string
     */
    formatMoonPhase(moonPhase) {
        if (!moonPhase) {
            return 'Unknown Moon Phase';
        }

        const { moonName, phaseName, dayInPhase, daysUntilNext } = moonPhase;
        let formatted = `${moonName}: ${phaseName}`;
        
        if (dayInPhase !== undefined) {
            formatted += ` (day ${dayInPhase + 1} of phase)`;
        }
        
        if (daysUntilNext > 0) {
            formatted += `, ${daysUntilNext} days until next phase`;
        }

        return formatted;
    }

    /**
     * Get a summary of all current moon phases
     * @param {Object} date - Date object (optional, uses current date if not provided)
     * @returns {string} Formatted string with all moon phases
     */
    getMoonPhaseSummary(date) {
        const moonPhases = this.getMoonPhaseInfo(date);
        if (moonPhases.length === 0) {
            return 'No moon information available';
        }

        return moonPhases
            .map(phase => this.formatMoonPhase(phase))
            .join('\n');
    }

    /**
     * Check if it's a new moon for either Ral or Guthay
     * @param {Object} date - Date object (optional, uses current date if not provided)
     * @returns {Object} Object with newMoon status for each moon
     */
    isNewMoon(date) {
        const moonPhases = this.getMoonPhaseInfo(date);
        const result = {
            ral: false,
            guthay: false,
            anyNewMoon: false
        };

        moonPhases.forEach(phase => {
            const isNew = phase.phaseName === 'New Moon';
            if (phase.moonName === 'Ral') {
                result.ral = isNew;
            } else if (phase.moonName === 'Guthay') {
                result.guthay = isNew;
            }
        });

        result.anyNewMoon = result.ral || result.guthay;
        return result;
    }

    /**
     * Check if it's a full moon for either Ral or Guthay
     * @param {Object} date - Date object (optional, uses current date if not provided)
     * @returns {Object} Object with fullMoon status for each moon
     */
    isFullMoon(date) {
        const moonPhases = this.getMoonPhaseInfo(date);
        const result = {
            ral: false,
            guthay: false,
            anyFullMoon: false
        };

        moonPhases.forEach(phase => {
            const isFull = phase.phaseName === 'Full Moon';
            if (phase.moonName === 'Ral') {
                result.ral = isFull;
            } else if (phase.moonName === 'Guthay') {
                result.guthay = isFull;
            }
        });

        result.anyFullMoon = result.ral || result.guthay;
        return result;
    }

    /**
     * Get the next occurrence of a specific moon phase
     * @param {string} moonName - Name of the moon ('Ral' or 'Guthay')
     * @param {string} phaseName - Name of the phase to find
     * @param {Object} startDate - Date to start searching from (optional, uses current date)
     * @param {number} maxDays - Maximum days to search (default: 200)
     * @returns {Object|null} Date object when the phase occurs, or null if not found
     */
    getNextMoonPhase(moonName, phaseName, startDate, maxDays = 200) {
        try {
            let currentDate = startDate || this.getCurrentDate();
            if (!currentDate) {
                return null;
            }

            for (let dayOffset = 1; dayOffset <= maxDays; dayOffset++) {
                // Advance to next day
                const nextDate = this.seasonsStars.manager.getActiveEngine().addDays(currentDate, dayOffset);
                
                // Check moon phase for this date
                const moonPhases = this.getMoonPhaseInfo(nextDate, moonName);
                if (moonPhases.length > 0 && moonPhases[0].phaseName === phaseName) {
                    return nextDate;
                }
            }

            return null; // Not found within the search period
        } catch (error) {
            console.error('🌞 Dark Sun Calendar | getNextMoonPhase: Error finding next moon phase:', error);
            return null;
        }
    }

    /**
     * Get the Dark Sun year name for a given year
     * Uses the 77 named years from the Dark Sun calendar configuration
     * Year names are based on the King's Age Year (1-77), not the overall year
     * If no year is specified, uses the current year
     */
    getYearName(year) {
        // If no year specified, use current year
        if (year === undefined || year === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                return "Unknown Year";
            }
            year = currentDate.year;
        }
        
        // Validate input
        if (typeof year !== 'number' || year < 1) {
            return "Unknown Year";
        }
        
        try {
            // Get the active calendar from Seasons & Stars
            const activeCalendar = this.getActiveCalendar();
            if (!activeCalendar) {
                return "Unknown Year";
            }
            
            // Get the named years configuration
            const namedYearsConfig = activeCalendar.extensions?.["seasons-and-stars"]?.namedYears;
            if (!namedYearsConfig || !namedYearsConfig.names || !Array.isArray(namedYearsConfig.names)) {
                return "Unknown Year";
            }
            
            const yearNames = namedYearsConfig.names;
            
            // Get the King's Age Year (1-77) for this year
            const kingsAgeYear = this.getKingsAgeYear(year);
            
            // Use the King's Age Year as the index (subtract 1 since arrays are 0-indexed)
            const yearIndex = kingsAgeYear - 1;
            const yearName = yearNames[yearIndex];
            
            return yearName;
            
        } catch (error) {
            return "Unknown Year";
        }
    }

    /**
     * Get the King's Age for a given year
     * King's Ages are 77-year cycles starting at year 1
     * King's Age 1: Years 1-77
     * King's Age 2: Years 78-154
     * King's Age 3: Years 155-231
     * etc.
     * If no year is specified, uses the current year
     */
    getKingsAge(year) {
        // If no year specified, use current year
        if (year === undefined || year === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
        return 1;
            }
            year = currentDate.year;
        }
        
        // Validate input
        if (typeof year !== 'number' || year < 1) {
            return 1; // Default to King's Age 1 for invalid input
        }
        
        // Calculate King's Age: Math.floor((year - 1) / 77) + 1
        // This gives us the correct King's Age for the 77-year cycle
        const kingsAge = Math.floor((year - 1) / 77) + 1;
        
        return kingsAge;
    }

    /**
     * Get the King's Age Year for a given year
     * Returns the year within the current King's Age cycle (1-77)
     * Year 1 = King's Age 1, Year 1
     * Year 78 = King's Age 2, Year 1
     * Year 79 = King's Age 2, Year 2
     * etc.
     * If no year is specified, uses the current year
     */
    getKingsAgeYear(year) {
        // If no year specified, use current year
        if (year === undefined || year === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                return 1;
            }
            year = currentDate.year;
        }
        
        // Validate input
        if (typeof year !== 'number' || year < 1) {
            return 1; // Default to year 1 for invalid input
        }
        
        // Calculate year within King's Age: ((year - 1) % 77) + 1
        // This gives us the year within the 77-year cycle (1-77)
        const kingsAgeYear = ((year - 1) % 77) + 1;
        
        return kingsAgeYear;
    }

    /**
     * Get the day of year (1-375 for Dark Sun) counting from month 1, day 1
     */
    getDayOfYear(date) {
        // Handle CalendarDate objects by converting to plain object
        let dateObject = date;
        if (date.toObject && typeof date.toObject === 'function') {
            dateObject = date.toObject();
        }
        
        // Validate required date properties
        if (typeof dateObject.year !== 'number' || typeof dateObject.month !== 'number' || typeof dateObject.day !== 'number') {
            return 1;
        }
        
        // Handle intercalary periods
        if (dateObject.intercalary) {
            // For intercalary periods, calculate based on which intercalary period it is
            if (dateObject.intercalary === "Cooling Sun") {
                // Cooling Sun: Days 121-125 (after month 4)
                return 121; // Always return day 121 for Cooling Sun (S&S treats it as a single period)
            } else if (dateObject.intercalary === "Soaring Sun") {
                // Soaring Sun: Days 246-250 (after month 8)
                return 246; // Always return day 246 for Soaring Sun
            } else if (dateObject.intercalary === "Highest Sun") {
                // Highest Sun: Days 371-375 (after month 12)
                return 371; // Always return day 371 for Highest Sun
            }
        }
        
        // Dark Sun calendar structure:
        // - 12 months of 30 days each = 360 days
        // - 3 intercalary periods of 5 days each = 15 days
        // - Total: 375 days per year
        
        // Intercalary periods occur after months 4, 8, and 12
        const intercalaryMonths = [4, 8, 12];
        
        let dayOfYear = 0;
        
        // Add days from previous months (30 days each)
        for (let month = 1; month < dateObject.month; month++) {
            dayOfYear += 30;
            
            // Add intercalary days if this month is followed by an intercalary period
            if (intercalaryMonths.includes(month)) {
                dayOfYear += 5;
            }
        }
        
        // Add days in current month
        dayOfYear += dateObject.day;
        
        return dayOfYear;
    }

    /**
     * Check if Dark Sun calendar is properly configured
     */
    checkCalendarStatus() {
        if (!this.seasonsStars?.api) {
            return {
                status: 'error',
                message: 'Seasons & Stars is not loaded',
                details: 'This module requires Seasons & Stars to function'
            };
        }
        
        const activeCalendar = this.getActiveCalendar();
        if (!activeCalendar) {
            return {
                status: 'error',
                message: 'No active calendar found',
                details: 'Seasons & Stars has no active calendar'
            };
        }
        
        if (activeCalendar.id !== 'dark-sun') {
            return {
                status: 'error',
                message: 'Wrong calendar active',
                details: `Expected Dark Sun calendar, found: ${activeCalendar.id}`
            };
        }
        
        // Check which configuration we're using
        const isLocalConfig = activeCalendar.year?.currentYear === 14579;
        const isBuiltInConfig = activeCalendar.year?.currentYear === 102;
        
        let configSource;
        if (isLocalConfig) {
            configSource = 'local dark-sun.json';
        } else if (isBuiltInConfig) {
            configSource = 'Seasons & Stars built-in';
        } else {
            configSource = 'unknown configuration';
        }
        
        return {
            status: 'success',
            message: 'Dark Sun Calendar is ready',
            details: 'All systems operational',
            usingLocalConfig: isLocalConfig,
            usingBuiltInConfig: isBuiltInConfig,
            currentYear: activeCalendar.year?.currentYear,
            configSource: configSource
        };
    }

    /**
     * Get detailed information about the current calendar configuration
     */
    getCalendarInfo() {
        const activeCalendar = this.getActiveCalendar();
        if (!activeCalendar) {
            return null;
        }
        
        return {
            id: activeCalendar.id,
            name: activeCalendar.translations?.en?.label || activeCalendar.name || 'Unknown',
            description: activeCalendar.translations?.en?.description || activeCalendar.description || '',
            currentYear: activeCalendar.year?.currentYear,
            epoch: activeCalendar.year?.epoch,
            monthCount: activeCalendar.months?.length || 0,
            weekdayCount: activeCalendar.weekdays?.length || 0,
            intercalaryPeriods: activeCalendar.intercalary?.length || 0,
            moonCount: activeCalendar.moons?.length || 0,
            hasNamedYears: !!(activeCalendar.extensions?.['seasons-and-stars']?.namedYears?.names?.length),
            namedYearCount: activeCalendar.extensions?.['seasons-and-stars']?.namedYears?.names?.length || 0,
            hasSeasons: !!(activeCalendar.extensions?.['seasons-and-stars']?.seasons?.length),
            seasonCount: activeCalendar.extensions?.['seasons-and-stars']?.seasons?.length || 0,
            configSource: (() => {
                const currentYear = activeCalendar.year?.currentYear;
                if (currentYear === 14579) return 'local dark-sun.json';
                if (currentYear === 102) return 'Seasons & Stars built-in';
                return 'unknown configuration';
            })()
        };
    }

    /**
     * Get the API for other modules
     */
    getAPI() {
        return {
            // Seasons & Stars API wrappers
            getCurrentDate: (...args) => this.getCurrentDate(...args),
            setCurrentDate: (...args) => this.setCurrentDate(...args),
            advanceDays: (...args) => this.advanceDays(...args),
            advanceHours: (...args) => this.advanceHours(...args),
            advanceMinutes: (...args) => this.advanceMinutes(...args),
            advanceWeeks: (...args) => this.advanceWeeks(...args),
            advanceMonths: (...args) => this.advanceMonths(...args),
            advanceYears: (...args) => this.advanceYears(...args),
            getActiveCalendar: (...args) => this.getActiveCalendar(...args),
            getAvailableCalendars: (...args) => this.getAvailableCalendars(...args),
            getMonthNames: (...args) => this.getMonthNames(...args),
            getWeekdayNames: (...args) => this.getWeekdayNames(...args),
            getSeasonInfo: (...args) => this.getSeasonInfo(...args),
            formatDate: (...args) => this.formatDate(...args),
            worldTimeToDate: (...args) => this.worldTimeToDate(...args),
            dateToWorldTime: (...args) => this.dateToWorldTime(...args),
            
            // Dark Sun specific methods
            getYearName: (year) => this.getYearName(year),
            getKingsAge: (year) => this.getKingsAge(year),
            getKingsAgeYear: (year) => this.getKingsAgeYear(year),
            getDayOfYear: (date) => this.getDayOfYear(date),
            formatDarkSunDate: (date) => this.formatDarkSunDate(date),
            getYearFromKingsAge: (kingsAge, kingsAgeYear) => this.getYearFromKingsAge(kingsAge, kingsAgeYear),
            setKingsAgeDate: (kingsAge, kingsAgeYear, month, day) => this.setKingsAgeDate(kingsAge, kingsAgeYear, month, day),
            
            // Moon phase methods
            getMoonPhaseInfo: (date, moonName) => this.getMoonPhaseInfo(date, moonName),
            getRalPhase: (date) => this.getRalPhase(date),
            getGuthayPhase: (date) => this.getGuthayPhase(date),
            getCurrentMoonPhases: () => this.getCurrentMoonPhases(),
            formatMoonPhase: (moonPhase) => this.formatMoonPhase(moonPhase),
            getMoonPhaseSummary: (date) => this.getMoonPhaseSummary(date),
            isNewMoon: (date) => this.isNewMoon(date),
            isFullMoon: (date) => this.isFullMoon(date),
            getNextMoonPhase: (moonName, phaseName, startDate, maxDays) => this.getNextMoonPhase(moonName, phaseName, startDate, maxDays),
            
            // Free Year conversion methods
            getFreeYear: (internalYear) => this.getFreeYear(internalYear),
            getInternalYear: (freeYear) => this.getInternalYear(freeYear),
            getKingsAgeFromFreeYear: (freeYear) => this.getKingsAgeFromFreeYear(freeYear),
            getKingsAgeYearFromFreeYear: (freeYear) => this.getKingsAgeYearFromFreeYear(freeYear),
            getYearNameFromFreeYear: (freeYear) => this.getYearNameFromFreeYear(freeYear),
            formatDarkSunDateFromFreeYear: (freeYear) => this.formatDarkSunDateFromFreeYear(freeYear),
            
            // Status methods
            isReady: () => this.isReady,
            checkCalendarStatus: () => this.checkCalendarStatus(),
            getCalendarInfo: () => this.getCalendarInfo(),

            // Widget controls
            showWidget: () => window.DarkSunCalendarGridWidget?.show(),
            hideWidget: () => window.DarkSunCalendarGridWidget?.hide(),
            toggleWidget: () => window.DarkSunCalendarGridWidget?.toggle(),
            showGridWidget: () => window.DarkSunCalendarGridWidget?.show(),
            hideGridWidget: () => window.DarkSunCalendarGridWidget?.hide(),
            toggleGridWidget: () => window.DarkSunCalendarGridWidget?.toggle(),

            // New method
            setKingsAge: (kingsAge, kingsAgeYear, dateOptions = {}) => this.setKingsAge(kingsAge, kingsAgeYear, dateOptions),
        };
    }

    /**
     * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
     */
    getOrdinalSuffix(number) {
        if (number >= 11 && number <= 13) {
            return 'th';
        }
        
        const lastDigit = number % 10;
        switch (lastDigit) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    /**
     * Format Dark Sun date in the traditional format
     * Format: "Xst/nd/rd/th year of King's Age Y, Year of [YearName]"
     */
    formatDarkSunDate(date) {
        // If no date specified, use current date
        if (!date) {
            date = this.getCurrentDate();
            if (!date) {
                console.error('🌞 Dark Sun Calendar | formatDarkSunDate: Could not get current date');
                return "Unknown Date";
            }
        }
        
        // Handle CalendarDate objects by converting to plain object
        let dateObject = date;
        if (date.toObject && typeof date.toObject === 'function') {
            dateObject = date.toObject();
        }
        
        // Validate required date properties
        if (typeof dateObject.year !== 'number') {
            console.error('🌞 Dark Sun Calendar | formatDarkSunDate: Invalid date object structure:', dateObject);
            return "Unknown Date";
        }
        
        const year = dateObject.year;
        const kingsAge = this.getKingsAge(year);
        const kingsAgeYear = this.getKingsAgeYear(year);
        const yearName = this.getYearName(year);
        
        const ordinalSuffix = this.getOrdinalSuffix(kingsAgeYear);
        
        const formattedDate = `${kingsAgeYear}${ordinalSuffix} year of King's Age ${kingsAge}, Year of ${yearName}`;
        
        
        return formattedDate;
    }

    /**
     * Convert from King's Age and King's Age Year to total year number
     * @param {number} kingsAge - The King's Age (1, 2, 3, etc.)
     * @param {number} kingsAgeYear - The year within the King's Age (1-77)
     * @returns {number} The total year number
     */
    getYearFromKingsAge(kingsAge, kingsAgeYear) {
        
        // Validate inputs
        if (typeof kingsAge !== 'number' || kingsAge < 1) {
            console.error('🌞 Dark Sun Calendar | getYearFromKingsAge: Invalid King\'s Age:', kingsAge);
            return 1;
        }
        
        if (typeof kingsAgeYear !== 'number' || kingsAgeYear < 1 || kingsAgeYear > 77) {
            console.error('🌞 Dark Sun Calendar | getYearFromKingsAge: Invalid King\'s Age Year:', kingsAgeYear);
            return 1;
        }
        
        // Calculate total year: (King's Age - 1) * 77 + King's Age Year
        const totalYear = (kingsAge - 1) * 77 + kingsAgeYear;
        
        
        return totalYear;
    }

    /**
     * Convert internal year to Free Year
     * Free Year = Internal Year - 14578
     * Note: There is no Free Year 0. Year 14578 = Free Year -1, Year 14579 = Free Year 1
     * If Free Year would be less than 1, subtract 1 to account for the missing Free Year 0
     * If no year is specified, uses the current year
     */
    getFreeYear(internalYear) {
        // If no year specified, use current year
        if (internalYear === undefined || internalYear === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                console.error('🌞 Dark Sun Calendar | getFreeYear: Could not get current date');
                return -14578;
            }
            internalYear = currentDate.year;
        }
        
        
        // Validate input
        if (typeof internalYear !== 'number') {
            console.error('🌞 Dark Sun Calendar | getFreeYear: Invalid internal year input:', internalYear);
            return -14578; // Default to Free Year -14578 for invalid input
        }
        
        // Calculate Free Year: Internal Year - 14578
        let freeYear = internalYear - 14578;
        
        // If Free Year would be less than 1, subtract 1 to account for the missing Free Year 0
        if (freeYear < 1) {
            freeYear -= 1;
        }
        
        
        return freeYear;
    }

    /**
     * Convert Free Year to internal year
     * Internal Year = Free Year + 14578
     * Note: There is no Free Year 0. Free Year -1 = Year 14578, Free Year 1 = Year 14579
     * If Free Year is less than 1, add 1 to account for the missing Free Year 0
     * If no year is specified, uses the current year
     */
    getInternalYear(freeYear) {
        // If no year specified, use current year
        if (freeYear === undefined || freeYear === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                console.error('🌞 Dark Sun Calendar | getInternalYear: Could not get current date');
                return 1;
            }
            freeYear = this.getFreeYear(currentDate.year);
        }
        
        // Validate input
        if (typeof freeYear !== 'number') {
            console.error('🌞 Dark Sun Calendar | getInternalYear: Invalid Free Year input:', freeYear);
            return 1; // Default to internal year 1 for invalid input
        }
        
        // If Free Year is less than 1, add 1 to account for the missing Free Year 0
        if (freeYear < 1) {
            freeYear += 1;
        }
        
        const internalYear = freeYear + 14578;
        
        
        return internalYear;
    }

    /**
     * Get King's Age from Free Year
     * If no year is specified, uses the current year
     */
    getKingsAgeFromFreeYear(freeYear) {
        // If no year specified, use current year
        if (freeYear === undefined || freeYear === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                console.error('🌞 Dark Sun Calendar | getKingsAgeFromFreeYear: Could not get current date');
                return 1;
            }
            freeYear = this.getFreeYear(currentDate.year);
        }
        
        // Convert Free Year to internal year, then get King's Age
        const internalYear = this.getInternalYear(freeYear);
        const kingsAge = this.getKingsAge(internalYear);
        
        
        return kingsAge;
    }

    /**
     * Get King's Age Year from Free Year
     * If no year is specified, uses the current year
     */
    getKingsAgeYearFromFreeYear(freeYear) {
        // If no year specified, use current year
        if (freeYear === undefined || freeYear === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                console.error('🌞 Dark Sun Calendar | getKingsAgeYearFromFreeYear: Could not get current date');
                return 1;
            }
            freeYear = this.getFreeYear(currentDate.year);
        }
        
        
        
        // Convert Free Year to internal year, then get King's Age Year
        const internalYear = this.getInternalYear(freeYear);
        const kingsAgeYear = this.getKingsAgeYear(internalYear);
        
        
        return kingsAgeYear;
    }

    /**
     * Get year name from Free Year
     * If no year is specified, uses the current year
     */
    getYearNameFromFreeYear(freeYear) {
        // If no year specified, use current year
        if (freeYear === undefined || freeYear === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                console.error('🌞 Dark Sun Calendar | getYearNameFromFreeYear: Could not get current date');
                return "Unknown Year";
            }
            freeYear = this.getFreeYear(currentDate.year);
        }
        
        
        
        // Convert Free Year to internal year, then get year name
        const internalYear = this.getInternalYear(freeYear);
        const yearName = this.getYearName(internalYear);
        
        
        return yearName;
    }

    /**
     * Format Dark Sun date from Free Year
     * If no year is specified, uses the current year
     */
    formatDarkSunDateFromFreeYear(freeYear) {
        // If no year specified, use current year
        if (freeYear === undefined || freeYear === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                console.error('🌞 Dark Sun Calendar | formatDarkSunDateFromFreeYear: Could not get current date');
                return "Unknown Date";
            }
            freeYear = this.getFreeYear(currentDate.year);
        }
        
        
        
        // Convert Free Year to internal year, then format date
        const internalYear = this.getInternalYear(freeYear);
        const kingsAge = this.getKingsAge(internalYear);
        const kingsAgeYear = this.getKingsAgeYear(internalYear);
        const yearName = this.getYearName(internalYear);
        
        const ordinalSuffix = this.getOrdinalSuffix(kingsAgeYear);
        const formattedDate = `${kingsAgeYear}${ordinalSuffix} year of King's Age ${kingsAge}, Year of ${yearName}`;
        
        
        return formattedDate;
    }

    /**
     * Set the current date using King's Age, King's Age Year, Month, and Day
     * All parameters are optional - only specified parameters will be changed
     * @param {number} kingsAge - The King's Age (1, 2, 3, etc.)
     * @param {number} kingsAgeYear - The year within the King's Age (1-77)
     * @param {number} month - The month (1-12)
     * @param {number} day - The day (1-30)
     */
    setKingsAgeDate(kingsAge, kingsAgeYear, month, day) {
        
        // Get current date to preserve unspecified values
        const currentDate = this.getCurrentDate();
        if (!currentDate) {
            console.error('🌞 Dark Sun Calendar | setKingsAgeDate: Could not get current date');
            return false;
        }
        
        // Validate and use provided values, or keep current values
        let newKingsAge = kingsAge;
        let newKingsAgeYear = kingsAgeYear;
        let newMonth = month;
        let newDay = day;
        
        // If King's Age is specified, validate it
        if (newKingsAge !== undefined && newKingsAge !== null) {
            if (typeof newKingsAge !== 'number' || newKingsAge < 1) {
                console.error('🌞 Dark Sun Calendar | setKingsAgeDate: Invalid King\'s Age:', newKingsAge);
                return false;
            }
        } else {
            // Keep current King's Age
            newKingsAge = this.getKingsAge();
        }
        
        // If King's Age Year is specified, validate it
        if (newKingsAgeYear !== undefined && newKingsAgeYear !== null) {
            if (typeof newKingsAgeYear !== 'number' || newKingsAgeYear < 1 || newKingsAgeYear > 77) {
                console.error('🌞 Dark Sun Calendar | setKingsAgeDate: Invalid King\'s Age Year:', newKingsAgeYear);
                return false;
            }
        } else {
            // Keep current King's Age Year
            newKingsAgeYear = this.getKingsAgeYear();
        }
        
        // If month is specified, validate it
        if (newMonth !== undefined && newMonth !== null) {
            if (typeof newMonth !== 'number' || newMonth < 1 || newMonth > 12) {
                console.error('🌞 Dark Sun Calendar | setKingsAgeDate: Invalid month:', newMonth);
                return false;
            }
        } else {
            // Keep current month
            newMonth = currentDate.month;
        }
        
        // If day is specified, validate it
        if (newDay !== undefined && newDay !== null) {
            if (typeof newDay !== 'number' || newDay < 1 || newDay > 30) {
                console.error('🌞 Dark Sun Calendar | setKingsAgeDate: Invalid day:', newDay);
                return false;
            }
        } else {
            // Keep current day
            newDay = currentDate.day;
        }
        
        // Convert King's Age and Year to total year
        const totalYear = this.getYearFromKingsAge(newKingsAge, newKingsAgeYear);
        
        // Create date object with the calculated year and preserved/updated month/day
        const newDate = {
            year: totalYear,
            month: newMonth,
            day: newDay
        };
        
        
        // Set the date using Seasons & Stars
        try {
            this.setCurrentDate(newDate);
            return true;
        } catch (error) {
            console.error('🌞 Dark Sun Calendar | setKingsAgeDate: Error setting date:', error);
            return false;
        }
    }

    /**
     * Set current date using day of year (1-375)
     */
    setDayOfYear(dayOfYear, year) {
        // If no year specified, use current year
        if (year === undefined || year === null) {
            const currentDate = this.getCurrentDate();
            if (!currentDate) {
                return false;
            }
            year = currentDate.year;
        }
        
        // Validate day of year
        if (typeof dayOfYear !== 'number' || dayOfYear < 1 || dayOfYear > 375) {
            return false;
        }
        
        // Validate year
        if (typeof year !== 'number' || year < 1) {
            return false;
        }
        
        // Check if this is an intercalary period that we need to handle ourselves
        const isIntercalaryPeriod = (dayOfYear >= 121 && dayOfYear <= 125) || 
                                   (dayOfYear >= 246 && dayOfYear <= 250) || 
                                   (dayOfYear >= 371 && dayOfYear <= 375);
        
        if (isIntercalaryPeriod) {
            // Handle intercalary periods ourselves - bypass Seasons & Stars
            console.log(`🌞 Dark Sun Calendar | setDayOfYear(${dayOfYear}) - Handling intercalary period ourselves`);
            
            // Store the intercalary date in our own storage
            const intercalaryDate = {
                year: year,
                dayOfYear: dayOfYear,
                isIntercalary: true
            };
            
            // Store this in a way that we can retrieve it later
            this._lastIntercalaryDate = intercalaryDate;
            
            // For now, set S&S to the start of the intercalary period
            // This ensures S&S doesn't interfere with our intercalary handling
            let baseDayOfYear;
            if (dayOfYear >= 121 && dayOfYear <= 125) {
                baseDayOfYear = 120; // Day before Cooling Sun
            } else if (dayOfYear >= 246 && dayOfYear <= 250) {
                baseDayOfYear = 245; // Day before Soaring Sun
            } else if (dayOfYear >= 371 && dayOfYear <= 375) {
                baseDayOfYear = 370; // Day before Highest Sun
            }
            
            // Convert base day to month/day and set S&S to that
            const { month, day } = this.dayOfYearToMonthDay(baseDayOfYear);
            const baseDate = {
                year: year,
                month: month,
                day: day,
                weekday: 0,
                time: { hour: 0, minute: 0, second: 0 }
            };
            
            console.log(`🌞 Dark Sun Calendar | Setting S&S to base date:`, baseDate);
            
            try {
                this.setCurrentDate(baseDate);
                return true;
            } catch (error) {
                console.error(`🌞 Dark Sun Calendar | Error setting base date:`, error);
                return false;
            }
        }
        
        // Regular day - use normal S&S handling
        // Clear any stored intercalary date
        this._lastIntercalaryDate = null;
        
        const { month, day, intercalary, intercalaryDay } = this.dayOfYearToMonthDay(dayOfYear);
        
        console.log(`🌞 Dark Sun Calendar | setDayOfYear(${dayOfYear}) -> month: ${month}, day: ${day}, intercalary: ${intercalary}, intercalaryDay: ${intercalaryDay}`);
        
        // Create the new date object
        const newDate = {
            year: year,
            month: month,
            day: day,
            weekday: 0, // Will be calculated by Seasons & Stars
            time: { hour: 0, minute: 0, second: 0 }
        };
        
        // Add intercalary property if present
        if (intercalary) {
            newDate.intercalary = intercalary;
        }
        
        console.log(`🌞 Dark Sun Calendar | Setting date to:`, newDate);
        
        // Set the date using Seasons & Stars
        try {
            this.setCurrentDate(newDate);
            return true;
        } catch (error) {
            console.error(`🌞 Dark Sun Calendar | Error setting date:`, error);
            return false;
        }
    }

    /**
     * Convert day of year (1-375) to month and day
     */
    dayOfYearToMonthDay(dayOfYear) {
        // Dark Sun calendar structure:
        // - 12 months of 30 days each = 360 days
        // - 3 intercalary periods of 5 days each = 15 days
        // - Total: 375 days per year
        
        // Intercalary periods occur after months 4, 8, and 12
        // Cooling Sun: Days 121-125 (after month 4)
        // Soaring Sun: Days 246-250 (after month 8)  
        // Highest Sun: Days 371-375 (after month 12)
        
        console.log(`🌞 Dark Sun Calendar | dayOfYearToMonthDay(${dayOfYear})`);
        
        // Check if it's in an intercalary period first
        if (dayOfYear >= 121 && dayOfYear <= 125) {
            // Cooling Sun (after month 4)
            const intercalaryDay = dayOfYear - 121 + 1;
            const result = { month: 4, day: 1, intercalary: "Cooling Sun", intercalaryDay: intercalaryDay };
            console.log(`🌞 Dark Sun Calendar | Day ${dayOfYear} is Cooling Sun day ${intercalaryDay} -> ${JSON.stringify(result)}`);
            return result;
        } else if (dayOfYear >= 246 && dayOfYear <= 250) {
            // Soaring Sun (after month 8)
            const intercalaryDay = dayOfYear - 246 + 1;
            const result = { month: 8, day: 1, intercalary: "Soaring Sun", intercalaryDay: intercalaryDay };
            console.log(`🌞 Dark Sun Calendar | Day ${dayOfYear} is Soaring Sun day ${intercalaryDay} -> ${JSON.stringify(result)}`);
            return result;
        } else if (dayOfYear >= 371 && dayOfYear <= 375) {
            // Highest Sun (after month 12)
            const intercalaryDay = dayOfYear - 371 + 1;
            const result = { month: 12, day: 1, intercalary: "Highest Sun", intercalaryDay: intercalaryDay };
            console.log(`🌞 Dark Sun Calendar | Day ${dayOfYear} is Highest Sun day ${intercalaryDay} -> ${JSON.stringify(result)}`);
            return result;
        }
        
        // Regular month calculation
        let remainingDays = dayOfYear;
        
        // Find which month this day belongs to
        for (let m = 1; m <= 12; m++) {
            const daysInMonth = 30;
            
            if (remainingDays <= daysInMonth) {
                const result = { month: m, day: remainingDays };
                console.log(`🌞 Dark Sun Calendar | Day ${dayOfYear} is regular month ${m}, day ${remainingDays} -> ${JSON.stringify(result)}`);
                return result;
            }
            
            remainingDays -= daysInMonth;
            
            // Skip intercalary periods for regular month calculation
            if (m === 4) {
                remainingDays -= 5; // Skip Cooling Sun
            } else if (m === 8) {
                remainingDays -= 5; // Skip Soaring Sun
            }
        }
        
        // Should never reach here for valid dayOfYear
        const result = { month: 12, day: remainingDays };
        console.log(`🌞 Dark Sun Calendar | Day ${dayOfYear} fallback -> ${JSON.stringify(result)}`);
        return result;
    }
}

/**
 * Dark Sun Calendar Module
 * Integrates with Seasons & Stars for Dark Sun calendar functionality
 */

/**
 * Scene controls integration for Dark Sun Calendar
 * Based on Seasons & Stars SeasonsStarsSceneControls
 */
class DarkSunCalendarSceneControls {
    /**
     * Add macro support for calendar widget
     */
    static registerMacros() {
        // Extend the existing DSC object with macro functions
        if (!window.DSC) {
            window.DSC = {};
        }
        // Add macro functions to the existing object
        Object.assign(window.DSC, {
            // Widget controls
            showWidget: () => window.DarkSunCalendarGridWidget?.show(),
            hideWidget: () => window.DarkSunCalendarGridWidget?.hide(),
            toggleWidget: () => window.DarkSunCalendarGridWidget?.toggle(),
            showGridWidget: () => window.DarkSunCalendarGridWidget?.show(),
            hideGridWidget: () => window.DarkSunCalendarGridWidget?.hide(),
            toggleGridWidget: () => window.DarkSunCalendarGridWidget?.toggle(),
            
            // Time advancement functions for macros (proxy to DSC)
            advanceMinutes: (minutes) => {
                if (darkSunCalendar) return darkSunCalendar.advanceMinutes(minutes);
            },
            advanceHours: (hours) => {
                if (darkSunCalendar) return darkSunCalendar.advanceHours(hours);
            },
            advanceDays: (days) => {
                if (darkSunCalendar) return darkSunCalendar.advanceDays(days);
            },
            advanceWeeks: (weeks) => {
                if (darkSunCalendar) return darkSunCalendar.advanceWeeks(weeks);
            },
            advanceMonths: (months) => {
                if (darkSunCalendar) return darkSunCalendar.advanceMonths(months);
            },
            advanceYears: (years) => {
                if (darkSunCalendar) return darkSunCalendar.advanceYears(years);
            },
        });
    }
}

// Module initialization
Hooks.once('init', () => {
    
    // Check if Seasons & Stars is loaded
    if (!game.modules.get('seasons-and-stars')?.active) {
        console.error('🌞 Dark Sun Calendar: Seasons & Stars module is not active!');
        return;
    }
    
});

// Setup after Foundry is ready
Hooks.once('ready', () => {
    
    // Wait for Seasons & Stars to be ready
    Hooks.once('seasons-stars:ready', async () => {
        
        try {
            // Initialize the Dark Sun Calendar instance
            darkSunCalendar = new DarkSunCalendar();
            await darkSunCalendar.initialize();
        
        // Register macros
        DarkSunCalendarSceneControls.registerMacros();
        
        } catch (error) {
            console.error('🌞 Dark Sun Calendar: Failed to initialize:', error);
            ui.notifications.error('Dark Sun Calendar failed to initialize. Check console for details.');
        }
    });
    
    // If SS is already ready, initialize immediately
    if (game.seasonsStars?.manager) {
        
        (async () => {
            try {
                // Initialize the Dark Sun Calendar instance
                darkSunCalendar = new DarkSunCalendar();
                await darkSunCalendar.initialize();
        
        // Register macros
        DarkSunCalendarSceneControls.registerMacros();
        
            } catch (error) {
                console.error('🌞 Dark Sun Calendar: Failed to initialize:', error);
                ui.notifications.error('Dark Sun Calendar failed to initialize. Check console for details.');
            }
        })();
    }
});

// Expose complete API through window.DSC
window.DSC = {
    // Seasons & Stars API wrappers
    getCurrentDate: (...args) => darkSunCalendar?.getCurrentDate(...args),
    setCurrentDate: (...args) => darkSunCalendar?.setCurrentDate(...args),
    advanceDays: (...args) => darkSunCalendar?.advanceDays(...args),
    advanceHours: (...args) => darkSunCalendar?.advanceHours(...args),
    advanceMinutes: (...args) => darkSunCalendar?.advanceMinutes(...args),
    advanceWeeks: (...args) => darkSunCalendar?.advanceWeeks(...args),
    advanceMonths: (...args) => darkSunCalendar?.advanceMonths(...args),
    advanceYears: (...args) => darkSunCalendar?.advanceYears(...args),
    getActiveCalendar: (...args) => darkSunCalendar?.getActiveCalendar(...args),
    getAvailableCalendars: (...args) => darkSunCalendar?.getAvailableCalendars(...args),
    getMonthNames: (...args) => darkSunCalendar?.getMonthNames(...args),
    getWeekdayNames: (...args) => darkSunCalendar?.getWeekdayNames(...args),
    getSeasonInfo: (...args) => darkSunCalendar?.getSeasonInfo(...args),
    formatDate: (...args) => darkSunCalendar?.formatDate(...args),
    worldTimeToDate: (...args) => darkSunCalendar?.worldTimeToDate(...args),
    dateToWorldTime: (...args) => darkSunCalendar?.dateToWorldTime(...args),
    
    // Dark Sun specific methods
    getYearName: (year) => darkSunCalendar?.getYearName(year),
    getKingsAge: (year) => darkSunCalendar?.getKingsAge(year),
    getKingsAgeYear: (year) => darkSunCalendar?.getKingsAgeYear(year),
    getDayOfYear: (date) => darkSunCalendar?.getDayOfYear(date),
    formatDarkSunDate: (date) => darkSunCalendar?.formatDarkSunDate(date),

    // Moon phase methods (AthasianMoonSystem)
    getMoonPhaseInfo: (date, moonName) => darkSunCalendar?.getMoonPhaseInfo(date, moonName),
    getRalPhase: (date) => darkSunCalendar?.getRalPhase(date),
    getGuthayPhase: (date) => darkSunCalendar?.getGuthayPhase(date),
    getCurrentMoonPhases: () => darkSunCalendar?.getCurrentMoonPhases(),
    
    // Eclipse methods (AthasianEclipseEngine)
    getEclipseInfo: (date) => {
        if (!darkSunCalendar?.eclipseCalculator) return null;
        const absoluteDay = window.AthasianCalendarCore?.dateToAbsoluteDays(date || darkSunCalendar.getCurrentDate());
        return darkSunCalendar.eclipseCalculator.getEclipseInfo(absoluteDay);
    },
    findNextEclipse: (minType = 'partial') => {
        if (!darkSunCalendar?.eclipseCalculator) return null;
        const absoluteDay = window.AthasianCalendarCore?.getCurrentAbsoluteDay();
        return darkSunCalendar.eclipseCalculator.findNextEclipse(absoluteDay, minType);
    },
    findPreviousEclipse: (minType = 'partial') => {
        if (!darkSunCalendar?.eclipseCalculator) return null;
        const absoluteDay = window.AthasianCalendarCore?.getCurrentAbsoluteDay();
        return darkSunCalendar.eclipseCalculator.findPreviousEclipse(absoluteDay, minType);
    },
    
    // Date conversion methods
    toAbsoluteDays: (kingsAge, year, dayOfYear) => window.AthasianCalendarCore?.toAbsoluteDays(kingsAge, year, dayOfYear),
    fromAbsoluteDays: (absoluteDays) => window.AthasianCalendarCore?.fromAbsoluteDays(absoluteDays),
    getCurrentAbsoluteDay: () => window.AthasianCalendarCore?.getCurrentAbsoluteDay(),
    formatMoonPhase: (moonPhase) => darkSunCalendar?.formatMoonPhase(moonPhase),
    getMoonPhaseSummary: (date) => darkSunCalendar?.getMoonPhaseSummary(date),
    isNewMoon: (date) => darkSunCalendar?.isNewMoon(date),
    isFullMoon: (date) => darkSunCalendar?.isFullMoon(date),
    getNextMoonPhase: (moonName, phaseName, startDate, maxDays) => darkSunCalendar?.getNextMoonPhase(moonName, phaseName, startDate, maxDays),
    
    // Status methods
    isReady: () => darkSunCalendar?.isReady || false,
    checkCalendarStatus: () => darkSunCalendar?.checkCalendarStatus(),
    getCalendarInfo: () => darkSunCalendar?.getCalendarInfo(),
    
    // Widget controls
    showWidget: () => window.DarkSunCalendarGridWidget?.show(),
    hideWidget: () => window.DarkSunCalendarGridWidget?.hide(),
    toggleWidget: () => window.DarkSunCalendarGridWidget?.toggle(),
    showGridWidget: () => window.DarkSunCalendarGridWidget?.show(),
    hideGridWidget: () => window.DarkSunCalendarGridWidget?.hide(),
    toggleGridWidget: () => window.DarkSunCalendarGridWidget?.toggle(),

    // New method
    getYearFromKingsAge: (kingsAge, kingsAgeYear) => darkSunCalendar?.getYearFromKingsAge(kingsAge, kingsAgeYear),

    // New methods for Free Year conversion
    getFreeYear: (internalYear) => darkSunCalendar?.getFreeYear(internalYear),
    getInternalYear: (freeYear) => darkSunCalendar?.getInternalYear(freeYear),
    getKingsAgeFromFreeYear: (freeYear) => darkSunCalendar?.getKingsAgeFromFreeYear(freeYear),
    getKingsAgeYearFromFreeYear: (freeYear) => darkSunCalendar?.getKingsAgeYearFromFreeYear(freeYear),
    getYearNameFromFreeYear: (freeYear) => darkSunCalendar?.getYearNameFromFreeYear(freeYear),
    formatDarkSunDateFromFreeYear: (freeYear) => darkSunCalendar?.formatDarkSunDateFromFreeYear(freeYear),

    // New method
    setKingsAgeDate: (kingsAge, kingsAgeYear, month, day) => darkSunCalendar?.setKingsAgeDate(kingsAge, kingsAgeYear, month, day),
    
    // New method for setting date by day of year
    setDayOfYear: (dayOfYear, year) => darkSunCalendar?.setDayOfYear(dayOfYear, year),
    
    // Debug and test methods
    testMoonPhases: () => {
        console.log('🌞 DSC: Testing moon phase functionality...');
        try {
            const currentDate = DSC.getCurrentDate();
            console.log('Current date:', currentDate);
            
            const moonPhases = DSC.getCurrentMoonPhases();
            console.log('Current moon phases:', moonPhases);
            
            const ralPhase = DSC.getRalPhase();
            console.log('Ral phase:', ralPhase);
            
            const guthayPhase = DSC.getGuthayPhase();
            console.log('Guthay phase:', guthayPhase);
            
            const summary = DSC.getMoonPhaseSummary();
            console.log('Moon phase summary:', summary);
            
            const calendarInfo = DSC.getCalendarInfo();
            console.log('Calendar info:', calendarInfo);
            
            // Test with a specific date
            const testDate = { year: 14579, month: 1, day: 15 };
            const testMoonPhases = DSC.getMoonPhaseInfo(testDate);
            console.log('Test date moon phases:', testMoonPhases);
            
            return {
                currentDate,
                moonPhases,
                ralPhase,
                guthayPhase,
                summary,
                calendarInfo,
                testMoonPhases
            };
        } catch (error) {
            console.error('🌞 DSC: Error in moon phase test:', error);
            return { error: error.message };
        }
    },
};

/**
 * Calculate day of year for Dark Sun calendar
 * Considers intercalary periods after months 4, 8, and 12
 */
function calculateDayOfYear(month, day, year) {
    // Intercalary periods occur after months 4, 8, and 12
    const intercalaryMonths = [4, 8, 12];
    
    let dayOfYear = 0;
    
    // Add days from previous months (30 days each)
    for (let m = 1; m < month; m++) {
        dayOfYear += 30;
        
        // Add intercalary days if this month is followed by an intercalary period
        if (intercalaryMonths.includes(m)) {
            dayOfYear += 5;
        }
    }
    
    // Add days in current month
    dayOfYear += day;
    
    return dayOfYear;
}

// Wait for S&S to be ready, then register scene controls
Hooks.once('seasons-stars:ready', async () => {
    await (window.CalendarDate ? Promise.resolve() : new Promise(resolve => {
        const check = () => window.CalendarDate ? resolve() : setTimeout(check, 50);
        check();
    }));
}); 