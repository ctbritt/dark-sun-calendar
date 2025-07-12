# Dark Sun Calendar

A comprehensive Athasian calendar system for Foundry VTT, providing authentic Dark Sun lore with lunar cycles, eclipse predictions, and historical events.

## Features

### 🌞 Complete Athasian Calendar
- **12 Months**: Scorch, Morrow, Rest, Gather, Breeze, Mist, Bloom, Haze, Hoard, Wind, Sorrow, Smolder
- **Intercalary Periods**: Cooling Sun, Soaring Sun, Highest Sun
- **King's Ages**: 77-year cycles with named years
- **Seasons**: High Sun, Sun Descending, Sun Ascending

### 🌙 Lunar System
- **Ral**: 33-day cycle, green-yellow moon
- **Guthay**: 125-day cycle, golden moon
- **Eclipse Predictions**: Solar eclipses based on moon alignments
- **Phase Tracking**: Real-time moon phase calculations

### 📅 Calendar Interface
- **Grid Widget**: Visual calendar with moon phase indicators
- **Chat Commands**: Comprehensive command set for calendar operations
- **Historical Events**: Timeline of major Dark Sun events
- **Free Year Conversion**: Utilities for Tyr's Free Year calendar

### 🎮 Foundry VTT Integration
- **Seasons & Stars**: Full integration with the calendar system
- **Module API**: JavaScript API for macros and other modules
- **Scene Controls**: Easy access to calendar functions
- **Permission System**: GM-only features with player viewing

## Installation

### Automatic Installation (Recommended)
1. In Foundry VTT, go to **Add-on Modules**
2. Click **Install Module**
3. Enter the manifest URL: `https://github.com/ctbritt/dark-sun-calendar/releases/latest/download/module.json`
4. Click **Install**
5. Enable the module in your world settings

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/ctbritt/dark-sun-calendar/releases)
2. Extract the zip file to your Foundry VTT `Data/modules/` directory
3. Restart Foundry VTT
4. Enable the module in your world settings

## Requirements

- **Foundry VTT**: Version 13 or higher
- **Seasons & Stars**: Required module for calendar functionality
- **Chat Commands**: Optional module for enhanced chat commands

## Usage

### Chat Commands
```
/date                    - Show current date
/time                    - Show current time
/advance 1 day          - Advance time by 1 day
/set-date 190 26 4 15   - Set date (King's Age, Year, Month, Day)
/goto 121               - Go to specific day of year
/moons                   - Show current moon phases
/eclipse next           - Show next eclipse
/season                  - Show current season
```

### JavaScript API
```javascript
// Get current date
const currentDate = window.DSC.getCurrentDate();

// Format date
const formatted = window.DSC.formatDarkSunDate(currentDate);

// Get moon phases
const moons = window.DSC.getCurrentMoonPhases();

// Advance time
window.DSC.advanceDays(1);

// Show calendar widget
window.DSC.showWidget();
```

### Calendar Widget
- **Access**: Use the calendar icon in scene controls
- **Navigation**: Click arrows to change month/year
- **Date Selection**: Click dates to set current date (GM only)
- **Moon Phases**: Hover over dates to see moon information
- **Eclipse Indicators**: Special styling for eclipse dates

## Configuration

### Module Settings
- **Calendar Display**: Choose between grid and mini widgets
- **Moon Phase Display**: Enable/disable moon phase indicators
- **Eclipse Notifications**: Configure eclipse alerts
- **Historical Events**: Toggle historical event display

### Dependencies
The module automatically detects and integrates with:
- **Seasons & Stars**: Primary calendar system
- **Chat Commands**: Enhanced chat functionality
- **Scene Controls**: UI integration

## Development

### Project Structure
```
dark-sun-calendar/
├── scripts/
│   ├── main.js              # Main module entry point
│   ├── chat-commands.js     # Chat command handlers
│   ├── calendar-grid.js     # Calendar widget
│   ├── moon-engine.js       # Lunar calculations
│   ├── eclipse-engine.js    # Eclipse predictions
│   ├── date-converter.js    # Date conversion utilities
│   └── ds-calendar-date.js  # Date object class
├── calendar/
│   └── dark-sun.json        # Calendar configuration
├── styles/
│   └── calendar-grid.css    # Widget styling
├── templates/
│   └── calendar-grid-widget.hbs
├── lang/
│   └── en.json             # Localization
└── module.json             # Module manifest
```

### Building
1. Clone the repository
2. Install dependencies: `npm install`
3. Make your changes
4. Test in Foundry VTT
5. Update version in `module.json` and `CHANGELOG.md`
6. Create a release tag: `git tag v13.0.1 && git push origin v13.0.1`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Update the changelog
5. Submit a pull request

### Code Style
- Use ES6+ JavaScript features
- Follow Foundry VTT module conventions
- Include JSDoc comments for public APIs
- Test thoroughly before submitting

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Athas.org**: Historical timeline and lore
- **Seasons & Stars**: Calendar system foundation
- **Foundry VTT Community**: Module development guidance
- **Dark Sun Setting**: Original TSR/Wizards of the Coast

## Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/ctbritt/dark-sun-calendar/issues)
- **Discussions**: Join the conversation on [GitHub Discussions](https://github.com/ctbritt/dark-sun-calendar/discussions)
- **Documentation**: See the [Wiki](https://github.com/ctbritt/dark-sun-calendar/wiki) for detailed guides

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of changes.

---

**May the crimson sun guide your path through the dying world of Athas.** 