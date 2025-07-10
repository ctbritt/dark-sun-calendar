// Async loader for calendar.json

/**
 * Load and parse calendar.json for the Dark Sun Calendar module
 * @returns {Promise<object>} Parsed calendar data
 */
export async function loadCalendarData() {
  try {
    // Use Foundry's module-relative path
    const path = "modules/dark-sun-calendar/calendar.json";
    const response = await fetch(path);
    
    if (!response.ok) {
      throw new Error(`Failed to load calendar.json: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate essential calendar structure
    if (!data.months || !Array.isArray(data.months)) {
      throw new Error('Calendar data missing or invalid months array');
    }
    
    if (!data.intercalary || !Array.isArray(data.intercalary)) {
      throw new Error('Calendar data missing or invalid intercalary array');
    }
    
    if (!data.extensions || !data.extensions['seasons-and-stars']) {
      throw new Error('Calendar data missing seasons-and-stars extension');
    }
    
    // Validate months have required properties
    for (let i = 0; i < data.months.length; i++) {
      const month = data.months[i];
      if (!month.name || typeof month.days !== 'number' || month.days <= 0) {
        throw new Error(`Invalid month data at index ${i}: missing name or invalid days`);
      }
    }
    
    // Validate intercalary periods have required properties
    for (let i = 0; i < data.intercalary.length; i++) {
      const inter = data.intercalary[i];
      if (!inter.name || typeof inter.days !== 'number' || inter.days <= 0 || typeof inter.after !== 'number') {
        throw new Error(`Invalid intercalary data at index ${i}: missing name, invalid days, or missing after property`);
      }
    }
    
    console.log('[DSC] Calendar data loaded and validated successfully');
    return data;
    
  } catch (error) {
    console.error('[DSC] Calendar data loading failed:', error);
    
    // Provide fallback data structure for basic functionality
    const fallbackData = {
      months: [
        { name: "Scorch", days: 30 },
        { name: "Morrow", days: 30 },
        { name: "Rest", days: 30 },
        { name: "Gather", days: 30 },
        { name: "Breeze", days: 30 },
        { name: "Mist", days: 30 },
        { name: "Bloom", days: 30 },
        { name: "Haze", days: 30 },
        { name: "Hoard", days: 30 },
        { name: "Wind", days: 30 },
        { name: "Sorrow", days: 30 },
        { name: "Smolder", days: 30 }
      ],
      intercalary: [
        { name: "Cooling Sun", days: 5, after: 4 },
        { name: "Soaring Sun", days: 5, after: 8 },
        { name: "Highest Sun", days: 5, after: 12 }
      ],
      extensions: {
        'seasons-and-stars': {
          namedYears: {
            names: ["Ral's Fury", "Friend's Contemplation", "Desert's Vengeance"]
          },
          seasons: [
            { name: "High Sun", monthStart: 11, monthEnd: 2 },
            { name: "Sun Descending", monthStart: 3, monthEnd: 6 },
            { name: "Sun Ascending", monthStart: 7, monthEnd: 10 }
          ]
        }
      }
    };
    
    console.warn('[DSC] Using fallback calendar data due to loading error');
    return fallbackData;
  }
}
