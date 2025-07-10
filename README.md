# Dark Sun Calendar

[![GitHub release](https://img.shields.io/github/release/ctbritt/dark-sun-calendar.svg)](https://github.com/ctbritt/dark-sun-calendar/releases)
[![Foundry VTT](https://img.shields.io/badge/Foundry%20VTT-v13-orange)](https://foundryvtt.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A comprehensive **Foundry VTT** module that implements the complete **Athasian calendar system** for **Dark Sun** campaigns. Experience the harsh world of Athas with accurate lunar cycles, King's Ages, intercalary periods, and thousands of years of meticulously tracked historical events.

## ✨ Features

### 🏜️ Complete Athasian Calendar System
- **King's Ages Calendar**: Full implementation of the official Dark Sun calendar with 77-year cycles
- **Intercalary Periods**: Cooling Sun, Soaring Sun, and Highest Sun special periods
- **Free Year System**: Support for both King's Age dating and Free Year (post-liberation) dating
- **Historical Events**: Over 300 historical events spanning thousands of years of Athasian history

### 🌙 Advanced Lunar System
- **Dual Moon Tracking**: Accurate simulation of **Ral** (red moon) and **Guthay** (white moon) phases
- **Eclipse Calculations**: Precise eclipse events with detailed astronomical information
- **Moon Phase Icons**: Beautiful visual representations of lunar phases
- **Astronomical Accuracy**: Based on official Dark Sun astronomical data

### 🎮 Foundry VTT Integration
- **Chat Commands**: Easy-to-use commands for calendar operations
- **Calendar Grid Widget**: Interactive calendar display with intercalary periods
- **Scene Controls**: Quick access macros and calendar tools
- **D&D 5e Integration**: Seamless compatibility with D&D 5e system
- **Multilingual Support**: Currently supports English with framework for additional languages

### 🔧 Technical Features
- **Date Conversion**: Convert between different calendar systems and formats
- **API Access**: Full programmatic access for module developers
- **Historical Timeline**: Search and browse historical events by date or importance
- **Time Advancement**: Advance time by days, weeks, months, or years with accurate calculations

## 📋 Requirements

- **Foundry VTT**: Version 13.0 or higher
- **D&D 5e System**: Version 5.0-6.0
- **Seasons & Stars Module**: *Required dependency* - provides the underlying calendar framework

## 🚀 Installation

### Automatic Installation (Recommended)
1. Open **Foundry VTT** and go to the **Add-on Modules** tab
2. Click **Install Module**
3. Search for "**Dark Sun Calendar**" or paste the manifest URL:
   ```
   https://github.com/ctbritt/dark-sun-calendar/releases/latest/download/module.json
   ```
4. Click **Install**

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/ctbritt/dark-sun-calendar/releases)
2. Extract the contents to your `Data/modules/dark-sun-calendar` folder
3. Restart Foundry VTT
4. Enable the module in your world's **Module Management** settings

### Dependencies Setup
1. Install **Seasons & Stars** module (required)
2. Enable both **Seasons & Stars** and **Dark Sun Calendar** in your world
3. The Dark Sun calendar will automatically be loaded and set as active

## 📖 Usage

### Basic Calendar Operations

#### Viewing the Current Date
```javascript
// Get current Athasian date
const currentDate = game.darkSunCalendar.getCurrentDate();
console.log(currentDate.formatDarkSunDate());
// Output: "Enemy's Slumber, 190th King's Age - Year 26, Month of Smolder, Day 15"
```

#### Advancing Time
```javascript
// Advance by days
await game.darkSunCalendar.advanceDays(5);

// Advance by weeks  
await game.darkSunCalendar.advanceWeeks(2);

// Advance by months
await game.darkSunCalendar.advanceMonths(1);
```

#### Setting Specific Dates
```javascript
// Set date using King's Age system
await game.darkSunCalendar.setKingsAgeDate(190, 26, 12, 15);

// Set date using Free Year system  
await game.darkSunCalendar.setFreeYearDate(1, 12, 15);
```

### Moon Phase Information

#### Current Moon Phases
```javascript
// Get current moon phases
const moonPhases = game.darkSunCalendar.getCurrentMoonPhases();
console.log(`Ral: ${moonPhases.ral.phaseName} (${moonPhases.ral.illumination}%)`);
console.log(`Guthay: ${moonPhases.guthay.phaseName} (${moonPhases.guthay.illumination}%)`);
```

#### Eclipse Information
```javascript
// Check for current eclipses
const eclipseInfo = game.darkSunCalendar.getEclipseInfo();
if (eclipseInfo.type !== 'none') {
    console.log(`Eclipse: ${eclipseInfo.description}`);
}
```

### Chat Commands

Use these commands in Foundry's chat:

- `/dscal` - Display current date and time
- `/dscal date` - Show detailed date information
- `/dscal moons` - Display current moon phases  
- `/dscal advance 5 days` - Advance time by 5 days
- `/dscal set ka 190 26 12 15` - Set King's Age date
- `/dscal set fy 1 12 15` - Set Free Year date
- `/dscal events` - Show historical events for current date

### Calendar Grid Widget

Access the interactive calendar through:
- **Scene Controls**: Calendar tool in the left toolbar
- **Chat Command**: `/dscal grid`
- **API Call**: `game.darkSunCalendar.showCalendarGrid()`

The calendar grid displays:
- Monthly view with proper weekday alignment
- Intercalary periods visually represented
- Moon phase indicators for each day
- Historical event markers
- Current date highlighting

## 🌟 Key Concepts

### King's Ages
The primary calendar system of Athas, consisting of 77-year cycles. Each age is named after a significant ruler or event. The current age in most campaigns is the **190th King's Age**, known as "**Enemy's Slumber**".

### Free Years  
An alternative dating system established after the liberation of Tyr. Free Year 1 corresponds to King's Age 190, Year 26. This system is used in post-liberation campaigns.

### Intercalary Periods
Special 5-day periods that occur three times per year:
- **Cooling Sun**: After Month 4 (Gather)
- **Soaring Sun**: After Month 8 (Haze)  
- **Highest Sun**: After Month 12 (Smolder)

These periods are not part of regular months and have special significance in Athasian culture.

### Lunar Cycles
- **Ral** (Red Moon): 25-day cycle, associated with battle and conflict
- **Guthay** (White Moon): 40-day cycle, associated with magic and mystery
- **Eclipse Cycle**: Complex 200-day pattern when both moons align

## 🛠️ Developer API

### Core API Access
```javascript
// Get the Dark Sun Calendar API
const api = game.darkSunCalendar.getAPI();

// All calendar operations are available through the API
const currentDate = api.getCurrentDate();
const moonPhases = api.getCurrentMoonPhases();
const seasonInfo = api.getSeasonInfo();
```

### Custom Integration
```javascript
// Listen for date changes
Hooks.on('dark-sun-calendar:dateChanged', (data) => {
    console.log('Date changed to:', data.newDate.formatDarkSunDate());
});

// Module ready hook
Hooks.on('dark-sun-calendar:ready', (data) => {
    console.log('Dark Sun Calendar is ready!');
    // Your initialization code here
});
```

### Date Conversion Utilities
```javascript
// Convert between date formats
const freeYear = game.darkSunCalendar.getFreeYear(internalYear);
const kingsAge = game.darkSunCalendar.getKingsAge(year);
const dayOfYear = game.darkSunCalendar.getDayOfYear(dateObject);

// Year name utilities
const yearName = game.darkSunCalendar.getYearName(year);
```

## 📅 Calendar Structure

### Months (12 months, 30 days each)
1. **Smolder** (Month 1)
2. **Emberfrost** (Month 2)  
3. **Sorrow** (Month 3)
4. **Gather** (Month 4) → *Cooling Sun*
5. **Planting** (Month 5)
6. **Silt** (Month 6)
7. **Storm** (Month 7)
8. **Haze** (Month 8) → *Soaring Sun*
9. **Wind** (Month 9)
10. **Fifthover** (Month 10)
11. **Bone** (Month 11)
12. **Smolder** (Month 12) → *Highest Sun*

### Weekdays (7 days)
1. **Dominary** 
2. **Ocron**
3. **Hornung** 
4. **Kinich**
5. **Talos**
6. **Zahd**
7. **Kleetik**

### Seasons
- **High Sun**: Months 5-8 (hottest period)
- **Sun Descending**: Months 9-12 (cooling period)  
- **Sun Ascending**: Months 1-4 (warming period)

## 🗂️ Historical Timeline

The module includes a comprehensive database of historical events spanning from the creation of the calendar system to current campaign dates. Events are categorized by importance:

- **Critical**: Major world-changing events
- **Major**: Significant regional or cultural events  
- **Minor**: Notable but localized events

Access historical events through:
- Chat commands: `/dscal events [date]`
- API: `game.darkSunCalendar.getHistoricalEvents(date)`
- Calendar grid: Events appear as markers on relevant dates

## 🌐 Localization

Currently supports:
- **English** (en) - Complete

Framework is in place for additional languages. To contribute translations:
1. Copy `lang/en.json` to `lang/[your-locale].json`
2. Translate the strings
3. Add the language entry to `module.json`
4. Submit a pull request

## 🔧 Configuration

The module includes several configuration options accessible through Foundry's module settings:

- **Default Calendar View**: Set the preferred calendar display mode
- **Chat Command Prefix**: Customize the chat command prefix (default: `/dscal`)
- **Historical Events Display**: Control how historical events are shown
- **Moon Phase Notifications**: Enable/disable automatic moon phase announcements

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`  
3. Run tests: `npm test`
4. Build: `npm run build`

### Reporting Issues
Please use the [GitHub Issues](https://github.com/ctbritt/dark-sun-calendar/issues) page to report bugs or request features.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TSR/Wizards of the Coast**: For creating the Dark Sun campaign setting
- **Seasons & Stars**: For providing the excellent calendar framework
- **Foundry VTT Community**: For their support and feedback
- **Athas.org**: For maintaining the comprehensive Dark Sun timeline

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/ctbritt/dark-sun-calendar/wiki)
- **Issues**: [GitHub Issues](https://github.com/ctbritt/dark-sun-calendar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ctbritt/dark-sun-calendar/discussions)
- **Discord**: [Foundry VTT Discord](https://discord.gg/foundryvtt) - #modules channel

---

*"Under the crimson sun of Athas, time moves differently. Let this calendar be your guide through the harsh ages of the Dark Sun."*