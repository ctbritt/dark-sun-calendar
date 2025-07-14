# Changelog

All notable changes to the Dark Sun Calendar module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Season information display in calendar grid widget
- Enhanced autocomplete suggestions for chat commands
- Improved date formatting with full month names
- Better error handling for missing dependencies

### Fixed
- Resolved `[object Object]` display issues in autocomplete
- Fixed date formatting to show correct King's Age
- Improved month name lookup for date objects from absolute days

## [13.0.0] - 2024-12-19

### Added
- Complete Dark Sun calendar system integration with Seasons & Stars
- Athasian moon system with Ral and Guthay lunar cycles
- Eclipse calculation and prediction engine
- Historical events timeline from official Dark Sun lore
- Chat commands for calendar operations (`/date`, `/time`, `/advance`, etc.)
- Calendar grid widget with moon phase display
- Free Year conversion utilities
- King's Age and year name calculations
- Intercalary period handling (Cooling Sun, Soaring Sun, Highest Sun)
- Season tracking (High Sun, Sun Descending, Sun Ascending)
- Module API for other modules and macros

### Features
- **Calendar System**: Full Athasian calendar with 12 months of 30 days each, plus 3 intercalary periods
- **Moon Phases**: Accurate lunar cycles for both Ral (33-day cycle) and Guthay (125-day cycle)
- **Eclipse System**: Predicts and calculates solar eclipses based on moon alignments
- **Historical Events**: Timeline of major events from Dark Sun lore
- **Chat Commands**: Comprehensive set of commands for calendar operations
- **Widget Interface**: Visual calendar grid with moon phase indicators
- **API Integration**: Full integration with Seasons & Stars module
- **Macro Support**: JavaScript API for custom macros and automation

### Technical
- Built on Foundry VTT v13+ architecture
- Requires Seasons & Stars module as dependency
- Modular design with separate engines for moons, eclipses, and date conversion
- Comprehensive error handling and validation
- Full TypeScript/JavaScript API documentation

## [12.0.0] - 2024-12-01

### Added
- Initial release of Dark Sun Calendar module
- Basic calendar functionality
- Integration with Seasons & Stars

---

## Version History

- **13.0.0**: Complete module with all features
- **12.0.0**: Initial release with basic functionality

## Contributing

When adding new features or making changes, please update this changelog with:

1. **Added** for new features
2. **Changed** for changes in existing functionality
3. **Deprecated** for soon-to-be removed features
4. **Removed** for now removed features
5. **Fixed** for any bug fixes
6. **Security** in case of vulnerabilities

## Release Process

1. Update version in `module.json`
2. Update this CHANGELOG.md with new version
3. Create and push a git tag: `git tag v13.0.0 && git push origin v13.0.0`
4. GitHub Actions will automatically create a release
5. The release will be available for Foundry VTT module installation 