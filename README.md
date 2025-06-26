# Dark Sun Calendar

A complete calendar system for the Dark Sun campaign setting, fully integrated with FoundryVTT. This module implements the intricate Athasian calendar, including King's Ages, the dual moons Ral and Guthay, complex seasons, and various special events. It is designed to work seamlessly with the [Seasons & Stars](https://foundryvtt.com/packages/seasons-and-stars) module, but can also function in a standalone mode.

---

## Features

- **Complete Athasian Calendar:** Implements the full calendar with its unique months, days, and intercalary periods.
- **King's Ages & Year Cycles:** Tracks the current King's Age and the 77-year cycle within it.
- **Dual Moon System:** Accurately calculates and displays the phases and positions of the two moons of Athas, Ral and Guthay.
- **Seasons & Special Events:** Automatically tracks the four seasons of Athas (Sun Descending, Sun Ascending, High Sun, and Rest) and highlights special events like eclipses, the Year of the Messenger, and more.
- **Interactive Calendar UI:**
  - An intuitive calendar interface accessible from the token controls.
  - Full-year view with months, days, and moon phases on each day.
  - Click any day to instantly set the world's date.
  - Detailed information panels for current date, time, moon phases, and upcoming events.
- **Seasons & Stars Integration:**
  - Robust integration with the **Seasons & Stars** module.
  - Automatically syncs the date between both modules.
  - Can use a `seasons-and-stars` calendar as the source of truth.
  - Includes fallback for standalone use if `seasons-and-stars` is not active.
- **Chat Commands:**
  - `/darksun date`: Display the current date in the chat.
  - `/darksun moon` or `/darksun moons`: Show the current phases of Ral and Guthay.
  - `/darksun advance [days]`: Advance the calendar forward or backward by a number of days.
- **Macro Support:**
  - Exposes a powerful `globalThis.DSC` API for scripters and macro enthusiasts to control the calendar programmatically.
- **Configurable Settings:**
  - Easily configure the current King's Age, year, and day from the module settings.

## Compatibility

- **FoundryVTT:** Version 13
- **Recommended:** [Seasons & Stars](https://foundryvtt.com/packages/seasons-and-stars) for the best experience. The module is designed to integrate tightly with it.

## Installation

1.  Go to the "Add-on Modules" tab in your FoundryVTT setup screen.
2.  Click "Install Module".
3.  In the "Manifest URL" field, paste the following link: `https://github.com/darksun-calendar/foundryvtt-dark-sun-calendar/releases/latest/download/module.json`
4.  Click "Install" and wait for the installation to complete.
5.  Activate the module in your game world's module settings.

## Usage

### The Calendar Window

You can open the Dark Sun Calendar in two main ways:

1.  **Token Controls:** Select a token to see the token controls on the left side of the screen. Click the calendar icon (`fas fa-calendar-alt`) to open the main calendar window.
2.  **Macros:** Use the macro `DarkSunCalendar.showCalendarDialog()` to open the window.

### Chat Commands

Use the following commands in the chat window for quick actions:

-   `/darksun date`: Shows the current date.
-   `/darksun moons`: Shows the current moon phases.
-   `/darksun advance 10`: Advances the calendar by 10 days.
-   `/darksun advance -5`: Rewinds the calendar by 5 days.

## For Macro-Makers

A global object `DSC` is available for use in your own macros.

**Examples:**

```javascript
// Get all current calendar data
const currentDate = await DSC.getCurrentDate();
console.log(currentDate);

// Set the date to the 15th day of the month "Scorch"
await DSC.setDateByMonthAndDay("Scorch", 15);

// Set the current King's Age to 191
await DSC.setKingsAge(191);

// Advance the calendar by 3 days
await DSC.advanceDays(3);

// Force the Dark Sun Calendar window to re-render (if it's open)
DSC.forceRerender();

// Manually sync the date from Seasons & Stars
await DSC.syncFromSS();
```

### Available `DSC` Functions:

-   `getCurrentDate()`: Returns an object with all current calendar data.
-   `setKingsAge(age)`: Sets the King's Age.
-   `setYearInAge(year)`: Sets the year within the current age.
-   `setDateByMonthAndDay(monthName, day)`: Sets the date by the name of a month and day number.
-   `setDateByDayOfYear(dayOfYear)`: Sets the date by the day of the year (1-375).
-   `advanceDays(days)`: Advances the calendar by a given number of days (can be negative).
-   `syncFromSS()`: Manually triggers a sync from the Seasons & Stars module.
-   `forceRerender()`: Forces the calendar UI to redraw.
-   `debugSS()`: Prints debug information about the Seasons & Stars integration to the console.

## Credits

-   **Author:** Dark Sun Calendar (as per `module.json`)
-   Based on the concepts from the **Merchant's Calendar Enhanced Web Edition**.

---

This module is a fan project and is not affiliated with or endorsed by the official Dark Sun license holders. 
# dark-sun-calendar
