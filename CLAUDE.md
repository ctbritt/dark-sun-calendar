# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FoundryVTT module implementing a complete Dark Sun (Athasian) calendar system. It provides an interactive calendar interface with dual moon tracking (Ral and Guthay), King's Ages cycles, seasonal tracking, and historical events integration.

## Architecture

### Core Components

- **Module Definition**: `module.json` - FoundryVTT module manifest with metadata and compatibility info
- **Calendar Data**: `calendar.json` - Complete Athasian calendar configuration for Seasons & Stars integration
- **Historical Events**: `historical_events.json` - Timeline of significant events in Athasian history
- **UI Template**: `templates/calendar.hbs` - Handlebars template for the main calendar interface
- **Localization**: `lang/en.json` - English translations for UI elements
- **Styling**: `styles/dark-sun-calendar.css` - CSS for calendar appearance

### Calendar System Structure

The Athasian calendar operates on a complex 77-year cycle within King's Ages:
- **375 days per year** (12 months of 30 days + 3 intercalary periods of 5 days each)
- **Dual moon system**: Ral (33-day cycle) and Guthay (125-day cycle)
- **Named years**: Combination of Endlean (11 names) and Seofean (7 names) cycles
- **Intercalary periods**: "Cooling Sun", "Soaring Sun", "Highest Sun" after months 4, 8, and 12

### Integration Points

- **Seasons & Stars Module**: Full bidirectional integration with enhanced astronomical features
- **FoundryVTT v13**: Module designed for Foundry v13 and AppV2 compatibility
- **Chat Commands**: `/darksun date`, `/darksun moons`, `/darksun advance [days]`
- **Global API**: `globalThis.DSC` object for macro integration
- **Enhanced S&S API**: Extends Seasons & Stars with `game.seasonsStars.api.darkSun` methods

## Key Development Notes


### Calendar Mathematics

Based on `plan.md`, the calendar math should follow these patterns:
- Epoch at KA 1, Year 1, Day 1 with grand eclipse (both moons full with identical rising and setting times [1800 and 0600, respectively])
- Date conversion: `dateFromAbsolute(yearsSinceEpoch, dayOfYear)` → CalendarDate object
- Moon phases: Ral (33-day period), Guthay (125-day period)
- Linear rise/set calculation based on phase fraction

### Data Structure Requirements

Calendar dates should include:
- King's Age number and year within age (1-77)
- Endlean/Seofean cycle names
- Month (1-12) or intercalary period (1-3) identification
- Day of year (1-375) and within month/intercalary
- Moon phase data for both Ral and Guthay

## Core Files

Essential module files:
- `module.json`: FoundryVTT module configuration
- `scripts/athasian-calendar-core.js`: Core calendar mathematics
- `scripts/athasian-moon-engine.js`: Moon phase calculations  
- `scripts/athasian-eclipse-engine.js`: Eclipse detection and prediction
- `scripts/dark-sun-calendar.js`: Main calendar integration
- `scripts/foundry-integration.js`: FoundryVTT-specific features
- `scripts/seasons-stars-integration.js`: Seasons & Stars compatibility
- `calendar.json`: Seasons & Stars calendar configuration
- `lang/en.json`: UI text and translations
- `styles/dark-sun-calendar.css`: Calendar styling

## Usage

**Chat Commands:**
- `/darksun date` - Show current date
- `/darksun moons` - Display moon phases
- `/darksun advance [days]` - Advance time

**API Access:**
- `DSC.getCurrentDate()` - Get current date info
- `DSC.advanceDays(number)` - Advance time
- `DSC.getNextEclipse()` - Get next eclipse

**Seasons & Stars Integration:**
- Automatic bidirectional sync when both modules active
- Enhanced astronomical data in Seasons & Stars
- Uses `dark-sun` calendar configuration