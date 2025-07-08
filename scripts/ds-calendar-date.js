/**
 * Dark Sun Calendar Date - Identical copy of Seasons & Stars CalendarDate
 * This ensures DSC has its own CalendarDate implementation without dependencies
 */

/**
 * Calendar Time Utilities for DSCalendarDate
 */
class DSCalendarTimeUtils {
    /**
     * Add ordinal suffix to a number (1st, 2nd, 3rd, etc.)
     */
    static addOrdinalSuffix(num) {
        const lastDigit = num % 10;
        const lastTwoDigits = num % 100;
        // Handle special cases (11th, 12th, 13th)
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
            return `${num}th`;
        }
        // Handle regular cases
        switch (lastDigit) {
            case 1:
                return `${num}st`;
            case 2:
                return `${num}nd`;
            case 3:
                return `${num}rd`;
            default:
                return `${num}th`;
        }
    }

    /**
     * Format time component with padding
     */
    static formatTimeComponent(value, padLength = 2) {
        return value.toString().padStart(padLength, '0');
    }
}

/**
 * Dark Sun Calendar Date Class
 * Identical to Seasons & Stars CalendarDate for full compatibility
 * Extended with Dark Sun specific properties
 */
class DSCalendarDate {
    constructor(data, calendar) {
        this.year = data.year;
        this.month = data.month;
        this.day = data.day;
        this.weekday = data.weekday;
        this.intercalary = data.intercalary;
        this.time = data.time;
        this.calendar = calendar;
        
        // Dark Sun specific properties
        this.kingsAge = data.kingsAge;
        this.kingsAgeYear = data.kingsAgeYear;
        this.yearName = data.yearName;
        this.dayOfYear = data.dayOfYear;
        this.freeYear = data.freeYear;
        
        // Calculate season information
        this.season = this.calculateSeason();
        
        // Calculate intercalary day information (if in intercalary period)
        this.intercalaryDay = this.calculateIntercalaryDay();
    }

    /**
     * Format the date for display
     */
    format(options = {}) {
        const { includeTime = false, includeWeekday = true, includeYear = true, format = 'long' } = options;
        const parts = [];

        // Add weekday if requested and not an intercalary day
        if (includeWeekday && !this.intercalary) {
            const weekdayName = this.getWeekdayName(format);
            parts.push(weekdayName);
        }

        // Handle intercalary days
        if (this.intercalary) {
            parts.push(this.intercalary);
        } else {
            // Regular date formatting
            const dayStr = this.getDayString(format);
            const monthStr = this.getMonthName(format);
            if (format === 'numeric') {
                parts.push(`${this.month}/${this.day}`);
            } else {
                parts.push(`${dayStr} ${monthStr}`);
            }
        }

        // Add year if requested
        if (includeYear) {
            const yearStr = this.getYearString();
            parts.push(yearStr);
        }

        // Add time if requested
        if (includeTime && this.time) {
            const timeStr = this.getTimeString();
            parts.push(timeStr);
        }

        return parts.join(', ');
    }

    /**
     * Get a short format string (for UI display)
     */
    toShortString() {
        return this.format({
            includeTime: false,
            includeWeekday: false,
            format: 'short',
        });
    }

    /**
     * Get a full format string (for detailed display)
     */
    toLongString() {
        // Use Dark Sun formatting if available
        if (this.kingsAge && this.kingsAgeYear && this.yearName) {
            const weekdayName = this.getWeekdayName('long');
            const dayStr = this.getDayString('long');
            const monthStr = this.getMonthName('long');
            const yearStr = `KA ${this.kingsAge}, ${this.kingsAgeYear}`;
            const yearNameStr = `Year of ${this.yearName}`;
            const timeStr = this.time ? `, ${this.getTimeString()}` : '';
            
            return `${weekdayName}, ${dayStr} ${monthStr}, ${yearStr}, ${yearNameStr}${timeStr}`;
        }
        
        // Fallback to standard format
        return this.format({
            includeTime: true,
            includeWeekday: true,
            includeYear: true,
            format: 'long',
        });
    }

    /**
     * Get just the date portion (no time)
     */
    toDateString() {
        // Use Dark Sun formatting if available
        if (this.kingsAge && this.kingsAgeYear && this.yearName) {
            const weekdayName = this.getWeekdayName('long');
            const dayStr = this.getDayString('long');
            const monthStr = this.getMonthName('long');
            const yearStr = `KA${this.kingsAge}, ${this.kingsAgeYear}`;
            const yearNameStr = `Year of ${this.yearName}`;
            
            return `${weekdayName}, ${dayStr} ${monthStr}, ${yearStr} ${yearNameStr}`;
        }
        
        // Fallback to standard format
        return this.format({
            includeTime: false,
            includeWeekday: true,
            includeYear: true,
            format: 'long',
        });
    }

    /**
     * Get just the time portion
     */
    toTimeString() {
        if (!this.time) return '';
        return this.getTimeString();
    }

    /**
     * Get the weekday name
     */
    getWeekdayName(format) {
        const weekday = this.calendar.weekdays[this.weekday];
        if (!weekday) return 'Unknown';
        if (format === 'short' && weekday.abbreviation) {
            return weekday.abbreviation;
        }
        return weekday.name;
    }

    /**
     * Get the month name
     */
    getMonthName(format) {
        // For intercalary periods, return the intercalary name instead
        if (this.intercalary) {
            return this.intercalary;
        }
        
        const month = this.calendar.months[this.month - 1];
        if (!month) return 'Unknown';
        if (format === 'short' && month.abbreviation) {
            return month.abbreviation;
        }
        return month.name;
    }

    /**
     * Get the day string with appropriate suffix
     */
    getDayString(format) {
        // For intercalary periods, return the intercalary day number
        if (this.intercalary && this.intercalaryDay) {
            if (format === 'numeric') {
                return this.intercalaryDay.toString();
            }
            // Add ordinal suffix for long format
            if (format === 'long') {
                return this.addOrdinalSuffix(this.intercalaryDay);
            }
            return this.intercalaryDay.toString();
        }
        
        if (format === 'numeric') {
            return this.day.toString();
        }
        // Add ordinal suffix for long format
        if (format === 'long') {
            return this.addOrdinalSuffix(this.day);
        }
        return this.day.toString();
    }

    /**
     * Get the year string with Dark Sun formatting
     */
    getYearString() {
        // Use Dark Sun year format if available
        if (this.kingsAge && this.kingsAgeYear) {
            return `KA${this.kingsAge}, ${this.kingsAgeYear}`;
        }
        
        // Fallback to standard calendar year format
        const { prefix = '', suffix = '' } = this.calendar.year || {};
        return `${prefix}${this.year}${suffix}`.trim();
    }

    /**
     * Get the time string
     */
    getTimeString() {
        if (!this.time) return '';
        const { hour, minute, second } = this.time;
        // Use 24-hour format by default
        const hourStr = DSCalendarTimeUtils.formatTimeComponent(hour);
        const minuteStr = DSCalendarTimeUtils.formatTimeComponent(minute);
        const secondStr = DSCalendarTimeUtils.formatTimeComponent(second);
        return `${hourStr}:${minuteStr}:${secondStr}`;
    }

    /**
     * Add ordinal suffix to a number (1st, 2nd, 3rd, etc.)
     */
    addOrdinalSuffix(num) {
        return DSCalendarTimeUtils.addOrdinalSuffix(num);
    }

    /**
     * Clone this date with optional modifications
     */
    clone(modifications = {}) {
        return new DSCalendarDate({
            year: modifications.year ?? this.year,
            month: modifications.month ?? this.month,
            day: modifications.day ?? this.day,
            weekday: modifications.weekday ?? this.weekday,
            intercalary: modifications.intercalary ?? this.intercalary,
            time: modifications.time ?? (this.time ? { ...this.time } : undefined),
            kingsAge: modifications.kingsAge ?? this.kingsAge,
            kingsAgeYear: modifications.kingsAgeYear ?? this.kingsAgeYear,
            yearName: modifications.yearName ?? this.yearName,
            dayOfYear: modifications.dayOfYear ?? this.dayOfYear,
            freeYear: modifications.freeYear ?? this.freeYear,
        }, this.calendar);
    }

    /**
     * Compare this date with another date
     */
    compareTo(other) {
        if (this.year !== other.year) return this.year - other.year;
        if (this.month !== other.month) return this.month - other.month;
        if (this.day !== other.day) return this.day - other.day;

        // Compare time if both have it
        if (this.time && other.time) {
            if (this.time.hour !== other.time.hour) return this.time.hour - other.time.hour;
            if (this.time.minute !== other.time.minute) return this.time.minute - other.time.minute;
            if (this.time.second !== other.time.second) return this.time.second - other.time.second;
        }
        return 0;
    }

    /**
     * Check if this date is equal to another date
     */
    equals(other) {
        return this.compareTo(other) === 0;
    }

    /**
     * Check if this date is before another date
     */
    isBefore(other) {
        return this.compareTo(other) < 0;
    }

    /**
     * Check if this date is after another date
     */
    isAfter(other) {
        return this.compareTo(other) > 0;
    }

    /**
     * Get a plain object representation
     */
    toObject() {
        return {
            year: this.year,
            month: this.month,
            day: this.day,
            weekday: this.weekday,
            intercalary: this.intercalary,
            time: this.time ? { ...this.time } : undefined,
            kingsAge: this.kingsAge,
            kingsAgeYear: this.kingsAgeYear,
            yearName: this.yearName,
            dayOfYear: this.dayOfYear,
            freeYear: this.freeYear,
            season: this.season,
            intercalaryDay: this.intercalaryDay,
        };
    }

    /**
     * Create a DSCalendarDate from a plain object
     */
    static fromObject(data, calendar) {
        return new DSCalendarDate(data, calendar);
    }

    /**
     * Get the King's Age for this date
     */
    getKingsAge() {
        return this.kingsAge;
    }

    /**
     * Get the King's Age Year for this date
     */
    getKingsAgeYear() {
        return this.kingsAgeYear;
    }

    /**
     * Get the year name for this date
     */
    getYearName() {
        return this.yearName;
    }

    /**
     * Get the day of year for this date
     */
    getDayOfYear() {
        return this.dayOfYear;
    }

    /**
     * Get the Free Year for this date
     */
    getFreeYear() {
        return this.freeYear;
    }

    /**
     * Calculate the season for this date
     */
    calculateSeason() {
        if (!this.calendar || !this.dayOfYear) {
            return null;
        }
        
        const day = this.dayOfYear;
        let seasonName = '';
        let startDay = 0;
        let endDay = 0;
        
        // Dark Sun seasonal logic:
        // if day >= 311 || day <= 60 season = "High Sun"
        // if day > 60 && day < 186 season = "Sun Descending"
        // otherwise season = "Sun Ascending"
        
        if ((day >= 311) || (day <= 60)) {
            seasonName = 'High Sun';
            startDay = 311;
            endDay = 60;
        } else if (day > 60 && day < 186) {
            seasonName = 'Sun Descending';
            startDay = 61;
            endDay = 185;
        } else {
            seasonName = 'Sun Ascending';
            startDay = 186;
            endDay = 310;
        }
        
        // Calculate season metrics
        let daysInSeason, daysIntoSeason, daysRemaining;
        
        if (seasonName === 'High Sun') {
            // High Sun spans across year boundary
            if (day >= 311) {
                // Days 311-375 (65 days)
                daysInSeason = 125; // 65 + 60
                daysIntoSeason = day - 311 + 1;
                daysRemaining = 375 - day + 60;
            } else {
                // Days 1-60 (60 days)
                daysInSeason = 125; // 65 + 60
                daysIntoSeason = day + 65; // 65 days from previous part + current day
                daysRemaining = 60 - day + 65; // Remaining days in this part + 65 from next part
            }
        } else {
            // Regular season calculation
            daysInSeason = endDay - startDay + 1;
            daysIntoSeason = day - startDay + 1;
            daysRemaining = endDay - day;
        }
        
        return {
            name: seasonName,
            description: '',
            startDay: startDay,
            endDay: endDay,
            daysInSeason: daysInSeason,
            daysIntoSeason: daysIntoSeason,
            daysRemaining: daysRemaining,
            dayOfYear: this.dayOfYear
        };
    }

    /**
     * Get the season information for this date
     */
    getSeason() {
        return this.season;
    }

    /**
     * Calculate the intercalary day for this date
     */
    calculateIntercalaryDay() {
        // If not in an intercalary period, return null
        if (!this.intercalary) {
            return null;
        }
        
        // Use the existing intercalary property from Seasons & Stars
        // and calculate which day of the period it is based on day of year
        const day = this.dayOfYear;
        
        // Dark Sun intercalary periods:
        // Cooling Sun: Days 121-125 (after month 4 - Gather)
        // Soaring Sun: Days 246-250 (after month 8 - Haze)  
        // Highest Sun: Days 371-375 (after month 12 - Smolder)
        
        if (this.intercalary === 'Cooling Sun' && day >= 121 && day <= 125) {
            return day - 121 + 1; // Day 1-5 of Cooling Sun
        } else if (this.intercalary === 'Soaring Sun' && day >= 246 && day <= 250) {
            return day - 246 + 1; // Day 1-5 of Soaring Sun
        } else if (this.intercalary === 'Highest Sun' && day >= 371 && day <= 375) {
            return day - 371 + 1; // Day 1-5 of Highest Sun
        }
        
        // If we get here, the intercalary property is set but the day doesn't match
        // This could happen if Seasons & Stars has incorrect intercalary logic
        // console.warn(`🌞 Dark Sun Calendar | Intercalary mismatch: ${this.intercalary} for day ${day}`);
        return null;
    }

    /**
     * Get the intercalary day for this date (1-5, or null if not in intercalary period)
     */
    getIntercalaryDay() {
        return this.intercalaryDay;
    }

    /**
     * Format the date in Dark Sun style
     * Returns: "Xst/nd/rd/th year of King's Age Y, Year of [YearName]"
     */
    formatDarkSunDate() {
        if (!this.kingsAge || !this.kingsAgeYear || !this.yearName) {
            return this.format(); // Fallback to regular format
        }
        
        const yearWithSuffix = DSCalendarTimeUtils.addOrdinalSuffix(this.kingsAgeYear);
        return `${yearWithSuffix} year of King's Age ${this.kingsAge}, Year of ${this.yearName}`;
    }

    /**
     * Get a short Dark Sun format
     * Returns: "King's Age X, Year Y"
     */
    formatDarkSunShort() {
        if (!this.kingsAge || !this.kingsAgeYear) {
            return this.format({ includeYear: true, format: 'short' });
        }
        
        return `King's Age ${this.kingsAge}, Year ${this.kingsAgeYear}`;
    }
}

// Export for use in other modules
window.DSCalendarDate = DSCalendarDate;
window.DSCalendarTimeUtils = DSCalendarTimeUtils; 