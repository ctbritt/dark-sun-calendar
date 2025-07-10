# Dark Sun Calendar for Foundry VTT

_“Under the crimson sun of Athas every second is a struggle.  Let the calendar keep count so you can focus on survival.”_

Dark Sun Calendar is an add-on module for the [Seasons & Stars](https://github.com/foundryvtt/seasons-and-stars) time-keeping system in **Foundry Virtual Tabletop** (FVT).  It brings the complete Athasian calendar—months, intercalary days, King’s Ages, named years, twin moons, eclipses and historical events—to your Dark Sun campaign with zero manual configuration.

---
## Table of contents
1.  [Feature highlights](#feature-highlights)
2.  [System requirements](#system-requirements)
3.  [Installation](#installation)
4.  [Getting started](#getting-started)
5.  [Chat commands](#chat-commands)
6.  [Macro & API examples](#macro--api-examples)
7.  [Development & testing](#development--testing)
8.  [Credits](#credits)
9.  [License](#license)

---
## Feature highlights
• **Full King’s Age calendar** – 12 months × 30 days plus 3 intercalary “Sun” periods for a 375-day year, with built-in season information, weekday names and leap-year logic.

• **Named-year cycle** – automatic 77-name rotation (e.g. *Ral’s Fury*, *Dragon’s Reverence*) and Free-Year conversions for the post-Kalak era.

• **Dual-moon engine** – physically-modelled phases for green Ral (33-day cycle) and golden Guthay (125-day cycle) including illumination %, next/previous phase helpers and pretty phase icons.

• **Eclipse prediction** – find partial, total or “Grand” eclipses (perfect alignment & both moons full) with magnitude, duration and descriptive flavour text.

• **Calendar grid widget** – re-skinned Seasons & Stars month view that correctly inserts the Cooling Sun, Soaring Sun and Highest Sun intercalary periods.

• **Rich chat integration** – 20+ slash commands via the _Chat Commander_ module for date queries, time control, moon & eclipse info, historical timelines and more.

• **Lore database** – 300+ timeline entries (JSON) from official Dark Sun sources, automatically filtered by King’s Age or Free-Year.

• **Extensive API** – programmatic access to every calculation for use in your own macros or modules (`window.DSC.getAPI()`).

---
## System requirements
* **Foundry VTT v13**
* [Seasons & Stars](https://foundryvtt.com/packages/seasons-and-stars) (minimum v4.0) – _required_
* [_Chat Commander_](https://foundryvtt.com/packages/_chatcommands) – _optional (but enables slash commands)_
* Any game system; pre-configured compatibility target is **dnd5e v5–6**

---
## Installation
### 1. Via manifest URL (recommended)
1. Open **Configuration → Add-on Modules → Install Module**.
2. Paste the manifest URL:
   ```text
   https://raw.githubusercontent.com/<your-repo>/dark-sun-calendar/module.json
   ```
3. Press **Install** and wait for Foundry to fetch the files.

### 2. Manual install
1. Download or clone this repository into your Foundry `Data/modules` folder:
   ```bash
   git clone https://github.com/<your-repo>/dark-sun-calendar.git "Data/modules/dark-sun-calendar"
   ```
2. Restart Foundry VTT and enable **Dark Sun Calendar** from the Modules list.

---
## Getting started
1. Make sure **Seasons & Stars** is also enabled.
2. Enable **Dark Sun Calendar** – on first load it will automatically:
   * Register the local `calendar/dark-sun-proposed.json` definition _(or fall back to the built-in S&S version if present)_.
   * Switch the active calendar to **Dark Sun**.
   * Spin-up the twin-moon & eclipse engines.
3. You are ready!  Open the **Dark Sun Calendar** tab in the sidebar, or run the `/calendar` chat command to pop up the month view.

> **GM tip** – run the macro in `test-intercalary-calendar.js` to visually confirm that intercalary periods render correctly.

---
## Chat commands
Commands are registered through _Chat Commander_.  All start with `/` – arguments in `<>` are required, `[]` are optional.

| Command | Description |
|---------|-------------|
| `/date` | Current King’s Age date in long form |
| `/time` | Current time of day |
| `/day`  | Combined date, season, moon phase & eclipse summary |
| `/year [year]` | Details for a specific internal year |
| `/moons [YYYY-M-D]` | Ral & Guthay phases on a given date |
| `/eclipse [next\|previous]` | Check eclipse status or jump to the next/previous one |
| `/advance <n> <unit>` | Advance game time (GM only) – `minutes, hours, days, weeks, months, years` |
| `/set-date <KA> <year> <month> <day>` | Set an exact King’s Age date (GM only) |
| `/goto <day-of-year>` | Jump to Day of Year 1-375 (GM only) |
| `/events <year>` | Historical events occurring in the given internal year |
| `/timeline [recent\|all]` | Show major lore milestones |

…and many more. Type `/` in chat to view auto-complete suggestions.

---
## Macro & API examples
```js
// Basic usage – see macro-example.js for a full script
const current = window.DSC.getCurrentDate();
ui.notifications.info(current.formatDarkSunDate());

// Determine next Grand Eclipse
const api = window.DSC.getAPI();
const nextGrand = api.eclipse.findNextEclipse(api.calendar.toAbsoluteDays(current.kingsAge, current.kingsAgeYear, current.month, current.day), 'grand');
console.log(nextGrand);
```

Helpful files:
* `macro-example.js` – shows how to read and format dates.
* `test-intercalary-calendar.js` – quick visual test for the calendar grid widget.

---
## Development & testing
This repository is plain JS/JSON/CSS – no build step required.  Clone, open in VS Code (or Cursor) and start Foundry.

Run the lightweight Node tests:
```bash
node test-intercalary-calendar.js
```

### Contributing
Pull requests are welcome!  Please open an issue first if you plan major changes such as localisation or rule alterations.

---
## Credits
* **Christopher Allbritton** – primary author (module, moon & eclipse engines)
* **Seasons & Stars** team – core calendar framework
* Wizards of the Coast – original *Dark Sun* setting (compliance with the Open Game License & SRD applies)

Historical timeline compiled from data at <https://athas.org/events/>.

---
## License
Released under the **MIT License**.  See the `LICENSE` file for details.