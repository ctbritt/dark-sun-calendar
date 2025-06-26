// Async loader for calendar.json

/**
 * Load and parse calendar.json for the Dark Sun Calendar module
 * @returns {Promise<object>} Parsed calendar data
 */
export async function loadCalendarData() {
  // Use Foundry's module-relative path
  const path = "modules/dark-sun-calendar/calendar.json";
  const response = await fetch(path);
  if (!response.ok)
    throw new Error(`Failed to load calendar.json: ${response.status}`);
  return await response.json();
}
