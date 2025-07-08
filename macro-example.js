const currentDate = window.DSC.getCurrentDate();
console.log(currentDate);

// Access Dark Sun properties
console.log(currentDate.kingsAge);        // 190
console.log(currentDate.kingsAgeYear);    // 26
console.log(currentDate.yearName);        // "Ral's Fury"
console.log(currentDate.dayOfYear);       // 95
console.log(currentDate.freeYear);        // 1

// Use Dark Sun formatting - currentDate is already a DSCalendarDate object
console.log(currentDate.formatDarkSunDate());  // "26th year of King's Age 190, Year of Ral's Fury"
console.log(currentDate.formatDarkSunShort()); // "King's Age 190, Year 26"

// You can also use other formatting methods
console.log(currentDate.toLongString());   // Full date with time
console.log(currentDate.toShortString());  // Short date format
console.log(currentDate.toDateString());   // Date only (no time) 