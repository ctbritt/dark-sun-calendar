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
     * Get the year string with prefix/suffix
     */
    getYearString() {
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
        };
    }

    /**
     * Create a DSCalendarDate from a plain object
     */
    static fromObject(data, calendar) {
        return new DSCalendarDate(data, calendar);
    }
}

// Export for use in other modules
window.DSCalendarDate = DSCalendarDate;
window.DSCalendarTimeUtils = DSCalendarTimeUtils; 