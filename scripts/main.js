/**
 * Dark Sun Calendar - Main Module Entry Point
 * A smart layer that integrates with Seasons & Stars to provide Dark Sun lore and functionality
 */

console.log('🌞 Dark Sun Calendar | Module loading...');

// Module instances
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
        console.log('🌞 Dark Sun Calendar | Initializing...');
        
        // Check if Seasons & Stars is loaded
        if (!game.seasonsStars?.api) {
            console.error('🌞 Dark Sun Calendar | ERROR: Seasons & Stars is not loaded! This module requires Seasons & Stars to function.');
            ui.notifications?.error('Dark Sun Calendar requires Seasons & Stars to be loaded and enabled.');
            throw new Error('Seasons & Stars is not loaded');
        }
        
        this.seasonsStars = game.seasonsStars;
        console.log('🌞 Dark Sun Calendar | Seasons & Stars detected');
        
        // Check if Dark Sun calendar is active
        const activeCalendar = this.seasonsStars.api.getActiveCalendar?.();
        if (!activeCalendar) {
            console.error('🌞 Dark Sun Calendar | ERROR: No active calendar found in Seasons & Stars!');
            ui.notifications?.error('Dark Sun Calendar requires an active calendar in Seasons & Stars.');
            throw new Error('No active calendar found in Seasons & Stars');
        }
        
        console.log('🌞 Dark Sun Calendar | Active calendar:', activeCalendar.id);
        
        if (activeCalendar.id !== 'dark-sun') {
            console.error('🌞 Dark Sun Calendar | ERROR: Active calendar is not Dark Sun!');
            console.error('🌞 Dark Sun Calendar | Expected: dark-sun, Found:', activeCalendar.id);
            ui.notifications?.error('Dark Sun Calendar requires the Dark Sun calendar to be active in Seasons & Stars.');
            throw new Error(`Active calendar is not Dark Sun: ${activeCalendar.id}`);
        } else {
            console.log('🌞 Dark Sun Calendar | Dark Sun calendar is active ✓');
        }
        
        // Setup integration
        this.setupIntegration();
        
        this.isReady = true;
        console.log('🌞 Dark Sun Calendar | Initialized successfully');
        
        // Fire ready hook
        Hooks.callAll('dark-sun-calendar:ready', {
            api: this.getAPI()
        });
    }

    /**
     * Setup integration with Seasons & Stars
     */
    setupIntegration() {
        console.log('🌞 Dark Sun Calendar | Setting up Seasons & Stars integration');
        
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
        
        console.log('🌞 Dark Sun Calendar | Date changed:', data.newDate);
        
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
        
        console.log('🌞 Dark Sun Calendar | Calendar changed:', data.newCalendarId);
    }

    /**
     * Get the Dark Sun year name for a given year
     */
    getYearName(year) {
        console.log('🌞 Dark Sun Calendar | getYearName called with year:', year);
        // TODO: Implement year name calculation
        return "Year Name Placeholder";
    }

    /**
     * Get the King's Age for a given year
     */
    getKingsAge(year) {
        console.log('🌞 Dark Sun Calendar | getKingsAge called with year:', year);
        // TODO: Implement King's Age calculation
        return 1;
    }

    /**
     * Get the King's Age Year for a given year
     */
    getKingsAgeYear(year) {
        console.log('🌞 Dark Sun Calendar | getKingsAgeYear called with year:', year);
        // TODO: Implement King's Age Year calculation
        return "King's Age Year Placeholder";
    }

    /**
     * Get the day of year (1-375 for Dark Sun) counting from month 1, day 1
     */
    getDayOfYear(date) {
        console.log('🌞 Dark Sun Calendar | getDayOfYear called with date:', date);
        
        // Handle CalendarDate objects by converting to plain object
        let dateObject = date;
        if (date.toObject && typeof date.toObject === 'function') {
            dateObject = date.toObject();
        }
        
        // Validate required date properties
        if (typeof dateObject.year !== 'number' || typeof dateObject.month !== 'number' || typeof dateObject.day !== 'number') {
            console.error('🌞 Dark Sun Calendar | getDayOfYear: Invalid date object structure:', dateObject);
            return 1;
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
        
        console.log(`🌞 Dark Sun Calendar | Day of year calculation: month ${dateObject.month}, day ${dateObject.day} = day ${dayOfYear}`);
        
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
        
        const activeCalendar = this.seasonsStars.api.getActiveCalendar?.();
        if (!activeCalendar) {
            return {
                status: 'error',
                message: 'No active calendar found',
                details: 'Seasons & Stars has no active calendar'
            };
        }
        
        if (activeCalendar.id !== 'dark-sun') {
            return {
                status: 'warning',
                message: 'Wrong calendar active',
                details: `Expected: dark-sun, Found: ${activeCalendar.id}`,
                activeCalendar: activeCalendar.id
            };
        }
        
        return {
            status: 'ok',
            message: 'Dark Sun calendar is active',
            details: 'All systems operational'
        };
    }

    /**
     * Get the API for other modules
     */
    getAPI() {
        return {
            // Enhanced getCurrentDate with Dark Sun day of year
            getCurrentDate: (...args) => {
                const currentDate = this.seasonsStars.api.getCurrentDate(...args);
                if (!currentDate) {
                    console.warn('🌞 Dark Sun Calendar | getCurrentDate returned null from S&S');
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
                
                // Add day of year
                dateObject.dayOfYear = this.getDayOfYear(dateObject);
                
                return dateObject;
            },
            setCurrentDate: (...args) => this.seasonsStars.api.setCurrentDate(...args),
            advanceDays: (...args) => this.seasonsStars.api.advanceDays(...args),
            advanceHours: (...args) => this.seasonsStars.api.advanceHours(...args),
            advanceMinutes: (...args) => this.seasonsStars.api.advanceMinutes(...args),
            advanceWeeks: (...args) => this.seasonsStars.api.advanceWeeks(...args),
            advanceMonths: (...args) => this.seasonsStars.api.advanceMonths(...args),
            advanceYears: (...args) => this.seasonsStars.api.advanceYears(...args),
            getActiveCalendar: (...args) => this.seasonsStars.api.getActiveCalendar(...args),
            getAvailableCalendars: (...args) => this.seasonsStars.api.getAvailableCalendars(...args),
            getMonthNames: (...args) => this.seasonsStars.api.getMonthNames(...args),
            getWeekdayNames: (...args) => this.seasonsStars.api.getWeekdayNames(...args),
            getSeasonInfo: (...args) => this.seasonsStars.api.getSeasonInfo(...args),
            formatDate: (...args) => this.seasonsStars.api.formatDate(...args),
            worldTimeToDate: (...args) => this.seasonsStars.api.worldTimeToDate(...args),
            dateToWorldTime: (...args) => this.seasonsStars.api.dateToWorldTime(...args),
            
            // Dark Sun specific methods
            getYearName: (year) => this.getYearName(year),
            getKingsAge: (year) => this.getKingsAge(year),
            getKingsAgeYear: (year) => this.getKingsAgeYear(year),
            getDayOfYear: (date) => this.getDayOfYear(date),
            
            // Status methods
            isReady: () => this.isReady,
            checkCalendarStatus: () => this.checkCalendarStatus()
        };
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
            // Time advancement functions for macros (proxy to S&S)
            advanceMinutes: async (minutes) => {
                const manager = game.seasonsStars?.manager;
                if (manager && manager.advanceMinutes)
                    await manager.advanceMinutes(minutes);
            },
            advanceHours: async (hours) => {
                const manager = game.seasonsStars?.manager;
                if (manager && manager.advanceHours)
                    await manager.advanceHours(hours);
            },
            advanceDays: async (days) => {
                const manager = game.seasonsStars?.manager;
                if (manager && manager.advanceDays)
                    await manager.advanceDays(days);
            },
            advanceWeeks: async (weeks) => {
                const manager = game.seasonsStars?.manager;
                if (manager && manager.advanceWeeks)
                    await manager.advanceWeeks(weeks);
            },
            advanceMonths: async (months) => {
                const manager = game.seasonsStars?.manager;
                if (manager && manager.advanceMonths)
                    await manager.advanceMonths(months);
            },
            advanceYears: async (years) => {
                const manager = game.seasonsStars?.manager;
                if (manager && manager.advanceYears)
                    await manager.advanceYears(years);
            },
        });
        console.log('🌞 Dark Sun Calendar: Macro functions registered');
    }
}

// Module initialization
Hooks.once('init', () => {
    console.log('🌞 Dark Sun Calendar: Initializing module');
    
    // Check if Seasons & Stars is loaded
    if (!game.modules.get('seasons-and-stars')?.active) {
        console.error('🌞 Dark Sun Calendar: Seasons & Stars module is not active!');
        return;
    }
    
    console.log('🌞 Dark Sun Calendar: Module initialized successfully');
});

// Setup after Foundry is ready
Hooks.once('ready', () => {
    console.log('🌞 Dark Sun Calendar: Setting up module');
    
    // Wait for Seasons & Stars to be ready
    Hooks.once('seasons-stars:ready', async () => {
        console.log('�� Dark Sun Calendar: Seasons & Stars is ready, initializing DSC');
        
        // Check if Dark Sun calendar is active
        const activeCalendar = game.seasonsStars?.manager?.getActiveCalendar();
        if (!activeCalendar || activeCalendar.id !== 'dark-sun') {
            console.error('🌞 Dark Sun Calendar: Dark Sun calendar is not active!');
            ui.notifications.error('Dark Sun Calendar requires Dark Sun calendar to be active in Seasons & Stars.');
            return;
        }
        
        // Register macros
        DarkSunCalendarSceneControls.registerMacros();
        
        console.log('🌞 Dark Sun Calendar: Module setup complete');
    });
    
    // If SS is already ready, initialize immediately
    if (game.seasonsStars?.manager) {
        console.log('🌞 Dark Sun Calendar: Seasons & Stars already ready, initializing immediately');
        
        // Check if Dark Sun calendar is active
        const activeCalendar = game.seasonsStars.manager.getActiveCalendar();
        if (!activeCalendar || activeCalendar.id !== 'dark-sun') {
            console.error('🌞 Dark Sun Calendar: Dark Sun calendar is not active!');
            ui.notifications.error('Dark Sun Calendar requires Dark Sun calendar to be active in Seasons & Stars.');
            return;
        }
        
        // Register macros
        DarkSunCalendarSceneControls.registerMacros();
        
        console.log('🌞 Dark Sun Calendar: Module setup complete');
    }
});

// Expose API
window.DSC = {
    getCurrentDate: () => {
        const manager = game.seasonsStars?.manager;
        if (!manager) {
            console.error('🌞 Dark Sun Calendar: Manager not available');
            return null;
        }
        
        const currentDate = manager.getCurrentDate();
        if (!currentDate) {
            console.error('🌞 Dark Sun Calendar: Could not get current date');
            return null;
        }
        
        // Add dayOfYear to the returned date object
        const dayOfYear = calculateDayOfYear(currentDate.month, currentDate.day, currentDate.year);
        return {
            ...currentDate,
            dayOfYear: dayOfYear
        };
    },
    
    // Placeholder methods for Dark Sun specific functionality
    yearName: (year) => {
        console.log('🌞 Dark Sun Calendar: yearName called with year:', year);
        // TODO: Implement year name calculation
        return `Year ${year}`;
    },
    
    KingsAge: () => {
        console.log('🌞 Dark Sun Calendar: KingsAge called');
        // TODO: Implement Kings Age calculation
        return 1;
    },
    
    KingsAgeYear: () => {
        console.log('🌞 Dark Sun Calendar: KingsAgeYear called');
        // TODO: Implement Kings Age year calculation
        return 1;
    },
    
    getDayOfYear: (month, day, year) => {
        return calculateDayOfYear(month, day, year);
    }
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