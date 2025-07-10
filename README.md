# Dark Sun Calendar

A comprehensive Athasian calendar system for Foundry VTT, providing complete King's Ages, lunar cycles, and historical events for the Dark Sun campaign setting.

## 🌞 Overview

The Dark Sun Calendar module brings the rich history and complex timekeeping of Athas to your Foundry VTT games. This module provides a complete calendar system that tracks King's Ages, lunar cycles, solar eclipses, and historical events from the Dark Sun campaign setting.

## ✨ Features

### 📅 Complete Calendar System
- **King's Ages**: Track the complex Athasian calendar with King's Ages and years
- **Lunar Cycles**: Realistic tracking of Athas's two moons (Ral and Guthay)
- **Solar Eclipses**: Dynamic eclipse calculations and predictions
- **Intercalary Periods**: Special periods between months (Cooling Sun, Soaring Sun, Highest Sun)

### 🗓️ Calendar Grid Widget
- Interactive calendar grid display
- Visual representation of months, weeks, and days
- Highlighted special events and historical dates
- Easy navigation between different time periods

### 📚 Historical Events Database
- Comprehensive database of Athasian historical events
- Events categorized by importance (critical, major, minor)
- Integration with calendar system for event tracking
- Rich lore from the Dark Sun setting

### 💬 Chat Commands
- Calendar navigation commands
- Date conversion utilities
- Event lookup and display
- Quick access to calendar information

### 🌙 Moon Engine
- Realistic lunar cycle calculations
- Moon phase tracking for both Ral and Guthay
- Eclipse prediction and timing
- Integration with calendar display

## 🚀 Installation

### Manual Installation
1. Download the module files
2. Extract to your Foundry VTT `modules` directory
3. Enable the module in your Foundry VTT world settings

### Dependencies
- **Required**: [Seasons and Stars](https://foundryvtt.com/packages/seasons-and-stars) module
- **Optional**: [_ChatCommands](https://foundryvtt.com/packages/_chatcommands) module (enables additional chat commands)

### Compatibility
- **Foundry VTT**: Version 13+
- **Systems**: D&D 5e (versions 5-6)
- **Verified**: Foundry VTT 13

## 📖 Usage

### Basic Calendar Navigation
The module provides several ways to interact with the calendar:

1. **Calendar Grid Widget**: Access through the module's main interface
2. **Chat Commands**: Use `/calendar` commands for quick access
3. **Date Conversion**: Convert between different date formats

### Key Features

#### Calendar Grid
- View monthly calendar layouts
- Navigate between different King's Ages
- See lunar phases and eclipse predictions
- Access historical events for specific dates

#### Historical Events
- Browse events by King's Age
- Filter by event importance
- View detailed event descriptions
- Track timeline of Athasian history

#### Lunar Tracking
- Monitor both moons (Ral and Guthay)
- Predict solar eclipses
- Track moon phases for magical purposes
- Integration with calendar display

## 🛠️ Technical Details

### Module Structure
```
dark-sun-calendar/
├── scripts/
│   ├── main.js              # Main module functionality
│   ├── calendar-grid.js      # Calendar grid widget
│   ├── chat-commands.js      # Chat command system
│   ├── date-converter.js     # Date conversion utilities
│   ├── ds-calendar-date.js   # Dark Sun date handling
│   ├── eclipse-engine.js     # Eclipse calculations
│   └── moon-engine.js        # Lunar cycle engine
├── styles/
│   └── calendar-grid.css     # Calendar styling
├── templates/
│   └── calendar-grid-widget.hbs  # Calendar template
├── lang/
│   └── en.json              # Localization
├── historical_events.json    # Historical events database
└── module.json              # Module configuration
```

### Core Systems

#### Date Conversion Engine
- Converts between real-world dates and Athasian dates
- Handles King's Age calculations
- Manages complex Athasian calendar rules

#### Moon Engine
- Calculates positions of Ral and Guthay
- Predicts solar eclipses
- Tracks lunar phases

#### Eclipse Engine
- Advanced eclipse prediction algorithms
- Integration with moon positions
- Historical eclipse tracking

## 🎮 Game Master Features

### Calendar Management
- Set campaign start dates
- Track in-game time progression
- Manage historical event triggers
- Customize calendar display

### Event Integration
- Link calendar events to game sessions
- Create custom historical events
- Manage event importance levels
- Integrate with campaign timeline

### Lunar Magic Integration
- Track moon phases for spellcasting
- Predict eclipse timing for rituals
- Manage lunar-based magical effects
- Integrate with spell systems

## 🔧 Configuration

### Module Settings
- Calendar display preferences
- Event notification settings
- Lunar tracking options
- Historical event filters

### Customization
- Modify calendar appearance
- Add custom historical events
- Adjust lunar cycle parameters
- Customize chat commands

## 📝 Development

### Testing
Use the provided test macro (`test-intercalary-calendar.js`) to verify calendar functionality:

```javascript
// Test intercalary periods in calendar grid
// Run this macro to test the calendar grid with intercalary periods
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This module is released under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- **Author**: Christopher Allbritton ([@ctbritt](https://github.com/ctbritt))
- **Dark Sun Setting**: Originally created by TSR/Wizards of the Coast
- **Foundry VTT**: The amazing virtual tabletop platform
- **Community**: All the players and GMs who inspired this module

## 🐛 Bug Reports & Support

If you encounter any issues or have suggestions:

1. Check the [Issues](https://github.com/ctbritt/dark-sun-calendar/issues) page
2. Create a new issue with detailed information
3. Include Foundry VTT version and system information
4. Provide steps to reproduce the problem

## 📚 Additional Resources

- [Dark Sun Campaign Setting](https://dnd.wizards.com/products/tabletop-games/rpg-products/dark-sun)
- [Foundry VTT Documentation](https://foundryvtt.com/article/)
- [Module Development Guide](https://foundryvtt.com/article/module-development/)

---

**Version**: 13.0.0  
**Last Updated**: 2024  
**Compatibility**: Foundry VTT 13+, D&D 5e 5-6