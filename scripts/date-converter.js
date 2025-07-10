/**
 * Dark Sun Calendar Date Converter
 * ================================
 * Converts between Dark Sun calendar dates and absolute days for astronomical calculations
 * Reference Point: KA1, Y1, D1 = Absolute Day 0 (both moons full, grand eclipse)
 */

/**
 * Athasian Calendar Core - Date Conversion Utilities
 * Provides conversion between Dark Sun calendar system and absolute days
 */
class AthasianCalendarCore {
    constructor() {
        // Calendar constants
        this.DAYS_PER_YEAR = 375;
        this.YEARS_PER_KINGS_AGE = 77;
        this.DAYS_PER_MONTH = 30;
        this.MONTHS_PER_YEAR = 12;
        this.INTERCALARY_PERIODS = 3;
        this.DAYS_PER_INTERCALARY = 5;
        
        // Intercalary period definitions
        this.INTERCALARY_POSITIONS = {
            "Cooling Sun": { afterMonth: 4, startDay: 121, endDay: 125 },
            "Soaring Sun": { afterMonth: 8, startDay: 246, endDay: 250 },
            "Highest Sun": { afterMonth: 12, startDay: 371, endDay: 375 }
        };
        
        // Reference point: KA1, Y1, D1 = Absolute Day 0
        this.REFERENCE_KINGS_AGE = 1;
        this.REFERENCE_YEAR = 1;
        this.REFERENCE_DAY = 1;
    }
    
    /**
     * Convert Dark Sun date to absolute days since reference point
     * @param {number} kingsAge - King's Age (1, 2, 3, etc.)
     * @param {number} year - Year within the King's Age (1-77)
     * @param {number} dayOfYear - Day of year (1-375)
     * @returns {number} Absolute days since KA1, Y1, D1
     */
    toAbsoluteDays(kingsAge, year, dayOfYear) {
        // Validate inputs
        if (!this.isValidKingsAge(kingsAge)) {
            throw new Error(`Invalid King's Age: ${kingsAge}`);
        }
        if (!this.isValidYear(year)) {
            throw new Error(`Invalid year within King's Age: ${year}`);
        }
        if (!this.isValidDayOfYear(dayOfYear)) {
            throw new Error(`Invalid day of year: ${dayOfYear}`);
        }
        
        // Calculate total years since reference
        const totalYears = this.getTotalYearsFromKingsAge(kingsAge, year) - 
                          this.getTotalYearsFromKingsAge(this.REFERENCE_KINGS_AGE, this.REFERENCE_YEAR);
        
        // Calculate absolute days
        const absoluteDays = (totalYears * this.DAYS_PER_YEAR) + (dayOfYear - this.REFERENCE_DAY);
        
        return absoluteDays;
    }
    
    /**
     * Convert absolute days to Dark Sun date
     * @param {number} absoluteDays - Absolute days since KA1, Y1, D1
     * @returns {object} {kingsAge, year, dayOfYear, monthDay}
     */
    fromAbsoluteDays(absoluteDays) {
        // Calculate total days since reference
        const totalDays = absoluteDays + this.REFERENCE_DAY - 1;
        
        // Calculate total years and remaining days
        const totalYears = Math.floor(totalDays / this.DAYS_PER_YEAR);
        const dayOfYear = (totalDays % this.DAYS_PER_YEAR) + 1;
        
        // Calculate reference total years
        const referenceTotalYears = this.getTotalYearsFromKingsAge(this.REFERENCE_KINGS_AGE, this.REFERENCE_YEAR);
        
        // Calculate actual total years from start of calendar
        const actualTotalYears = referenceTotalYears + totalYears;
        
        // Convert to King's Age format
        const { kingsAge, year } = this.getKingsAgeFromTotalYears(actualTotalYears);
        
        // Convert day of year to month/day
        const monthDay = this.dayOfYearToMonthDay(dayOfYear);
        
        return {
            kingsAge,
            year,
            dayOfYear,
            ...monthDay
        };
    }
    
    /**
     * Convert King's Age and year to total years
     * @param {number} kingsAge - King's Age
     * @param {number} year - Year within King's Age
     * @returns {number} Total years since calendar epoch
     */
    getTotalYearsFromKingsAge(kingsAge, year) {
        return (kingsAge - 1) * this.YEARS_PER_KINGS_AGE + year;
    }
    
    /**
     * Convert total years to King's Age format
     * @param {number} totalYears - Total years since calendar epoch
     * @returns {object} {kingsAge, year}
     */
    getKingsAgeFromTotalYears(totalYears) {
        const kingsAge = Math.floor((totalYears - 1) / this.YEARS_PER_KINGS_AGE) + 1;
        const year = ((totalYears - 1) % this.YEARS_PER_KINGS_AGE) + 1;
        
        return { kingsAge, year };
    }
    
    /**
     * Convert day of year to month and day
     * @param {number} dayOfYear - Day of year (1-375)
     * @returns {object} {month, day, intercalary, intercalaryDay}
     */
    dayOfYearToMonthDay(dayOfYear) {
        // Check if it's in an intercalary period
        for (const [name, info] of Object.entries(this.INTERCALARY_POSITIONS)) {
            if (dayOfYear >= info.startDay && dayOfYear <= info.endDay) {
                return {
                    month: info.afterMonth,
                    day: 1, // Placeholder for S&S compatibility
                    intercalary: name,
                    intercalaryDay: dayOfYear - info.startDay + 1
                };
            }
        }
        
        // Regular month calculation
        let remainingDays = dayOfYear;
        
        for (let month = 1; month <= this.MONTHS_PER_YEAR; month++) {
            if (remainingDays <= this.DAYS_PER_MONTH) {
                return {
                    month,
                    day: remainingDays
                };
            }
            
            remainingDays -= this.DAYS_PER_MONTH;
            
            // Check for intercalary periods after this month
            // Note: Intercalary periods are inserted BETWEEN months, not within them
            if (month === 4 && remainingDays > 5) {
                remainingDays -= 5; // Skip Cooling Sun
            } else if (month === 8 && remainingDays > 5) {
                remainingDays -= 5; // Skip Soaring Sun
            }
        }
        
        // Fallback (should not reach here for valid dayOfYear)
        return {
            month: 12,
            day: remainingDays
        };
    }
    
    /**
     * Convert month and day to day of year
     * @param {number} month - Month (1-12)
     * @param {number} day - Day of month (1-30)
     * @param {string} intercalary - Intercalary period name (optional)
     * @param {number} intercalaryDay - Day within intercalary period (optional)
     * @returns {number} Day of year (1-375)
     */
    monthDayToDayOfYear(month, day, intercalary = null, intercalaryDay = null) {
        // Handle intercalary periods
        if (intercalary && intercalaryDay) {
            const info = this.INTERCALARY_POSITIONS[intercalary];
            if (info) {
                return info.startDay + intercalaryDay - 1;
            }
        }
        
        let dayOfYear = 0;
        
        // Add days from previous months
        for (let m = 1; m < month; m++) {
            dayOfYear += this.DAYS_PER_MONTH;
            
            // Add intercalary days after specific months
            if (m === 4) {
                dayOfYear += 5; // Cooling Sun
            } else if (m === 8) {
                dayOfYear += 5; // Soaring Sun
            }
        }
        
        // Add days in current month
        dayOfYear += day;
        
        return dayOfYear;
    }
    
    /**
     * Convert a DSCalendarDate to absolute days
     * @param {DSCalendarDate|object} date - Calendar date object
     * @returns {number} Absolute days since reference
     */
    dateToAbsoluteDays(date) {
        // Handle CalendarDate objects by converting to plain object
        let dateObject = date;
        if (date.toObject && typeof date.toObject === 'function') {
            dateObject = date.toObject();
        }
        
        // Use existing DSC methods
        const kingsAge = window.DSC.getKingsAge(dateObject.year);
        const kingsAgeYear = window.DSC.getKingsAgeYear(dateObject.year);
        
        // Calculate day of year
        let dayOfYear;
        if (dateObject.dayOfYear) {
            dayOfYear = dateObject.dayOfYear;
        } else {
            dayOfYear = window.DSC.getDayOfYear(dateObject);
        }
        
        return this.toAbsoluteDays(kingsAge, kingsAgeYear, dayOfYear);
    }
    
    /**
     * Validation methods
     */
    isValidKingsAge(kingsAge) {
        return typeof kingsAge === 'number' && kingsAge >= 1;
    }
    
    isValidYear(year) {
        return typeof year === 'number' && year >= 1 && year <= this.YEARS_PER_KINGS_AGE;
    }
    
    isValidDayOfYear(dayOfYear) {
        return typeof dayOfYear === 'number' && dayOfYear >= 1 && dayOfYear <= this.DAYS_PER_YEAR;
    }
    
    /**
     * Get current absolute day based on Dark Sun Calendar
     * @returns {number} Current absolute day
     */
    getCurrentAbsoluteDay() {
        // Get current date from Dark Sun Calendar
        const currentDate = window.DSC?.getCurrentDate?.();
        if (!currentDate) {
            console.warn('AthasianCalendarCore: Could not get current date from DSC');
            return 0;
        }
        
        return this.dateToAbsoluteDays(currentDate);
    }
    
    /**
     * Test the conversion system
     * @returns {boolean} True if tests pass
     */
    testConversions() {
        console.log('AthasianCalendarCore: Testing date conversions...');
        
        // Test reference point
        const refAbsolute = this.toAbsoluteDays(1, 1, 1);
        if (refAbsolute !== 0) {
            throw new Error(`Reference point test failed: expected 0, got ${refAbsolute}`);
        }
        
        // Test round-trip conversion
        const testDates = [
            { ka: 1, y: 1, d: 1 },
            { ka: 1, y: 77, d: 375 },
            { ka: 2, y: 1, d: 1 },
            { ka: 190, y: 1, d: 1 }, // Current era
        ];
        
        for (const testDate of testDates) {
            const absolute = this.toAbsoluteDays(testDate.ka, testDate.y, testDate.d);
            const converted = this.fromAbsoluteDays(absolute);
            
            if (converted.kingsAge !== testDate.ka || 
                converted.year !== testDate.y || 
                converted.dayOfYear !== testDate.d) {
                throw new Error(`Round-trip test failed for KA${testDate.ka}, Y${testDate.y}, D${testDate.d}`);
            }
        }
        
        console.log('AthasianCalendarCore: All tests passed!');
        return true;
    }
}

// Create global instance
const athasianCalendarCore = new AthasianCalendarCore();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        AthasianCalendarCore,
        athasianCalendarCore
    };
} else {
    // Browser/FoundryVTT environment
    window.AthasianCalendarCore = athasianCalendarCore;
} 