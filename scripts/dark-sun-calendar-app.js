// Dark Sun Calendar v2 Application for Foundry VTT
class DarkSunCalendarApp extends foundry.applications.api.ApplicationV2 {
  constructor(foundryDarkSunCalendar) {
    super();
    this.foundryDarkSunCalendar = foundryDarkSunCalendar;

    // Re-render when settings change
    Hooks.on("updateSetting", (setting) => {
      if (this.rendered) this.render(false);
    });
  }

  // Change from getter to static property
  static DEFAULT_OPTIONS = {
    id: "dark-sun-calendar-app",
    tag: "div", // v2 requires a tag
    window: {
      title: "Dark Sun Calendar",
      icon: "fas fa-calendar-alt",
    },
    position: {
      width: 800,
      height: "auto",
    },
    classes: ["dsc-calendar-container"],
    // Define actions for event handling
    actions: {
      advanceDay: DarkSunCalendarApp._onAdvanceDay,
      showGrid: DarkSunCalendarApp._onShowGrid,
      showDetails: DarkSunCalendarApp._onShowDetails,
    },
  };

  // Define template parts (v2 pattern)
  static PARTS = {
    calendar: {
      template: "modules/your-module-name/templates/calendar.hbs", // or use inline
    },
  };

  // Prepare context data for template (replaces getData)
  async _prepareContext(options) {
    const cal = this.foundryDarkSunCalendar;

    // Sync calendar state with settings
    cal.calendar.setDate(
      cal.settings.kingsAge,
      cal.settings.yearInAge,
      cal.settings.dayOfYear
    );

    const currentDate = cal.calendar.getCurrentDate();
    const calendarGrid = this.generateCalendarGrid(currentDate);

    return {
      currentDate,
      calendarGrid,
      isGM: game.user.isGM,
    };
  }

  // Generate calendar grid with astronomical events
  generateCalendarGrid(currentDate) {
    const grid = {
      months: [],
      intercalary: [],
    };

    // Generate 12 regular months
    for (let month = 1; month <= 12; month++) {
      const monthData = this.generateMonthData(month, currentDate);
      grid.months.push(monthData);
    }

    // Generate 3 intercalary periods
    const intercalaryNames = ["Cooling Sun", "Soaring Sun", "Highest Sun"];
    const intercalaryAfter = [4, 8, 12]; // After which months they occur

    for (let i = 0; i < 3; i++) {
      const intercalaryData = this.generateIntercalaryData(
        intercalaryNames[i],
        intercalaryAfter[i],
        currentDate
      );
      grid.intercalary.push(intercalaryData);
    }

    return grid;
  }

  // Generate data for a single month
  generateMonthData(monthNumber, currentDate) {
    const monthNames = [
      "Scorch",
      "Morrow",
      "Rest",
      "Gather",
      "Breeze",
      "Mist",
      "Bloom",
      "Haze",
      "Hoard",
      "Wind",
      "Sorrow",
      "Smolder",
    ];

    const month = {
      name: monthNames[monthNumber - 1],
      number: monthNumber,
      days: [],
      astronomicalEvents: [],
    };

    // Calculate start day of year for this month
    let startDayOfYear = 1;
    for (let m = 1; m < monthNumber; m++) {
      startDayOfYear += 30; // Each month has 30 days
      // Add intercalary days after months 4, 8
      if (m === 4 || m === 8) {
        startDayOfYear += 5;
      }
    }

    // Generate 30 days for this month
    for (let day = 1; day <= 30; day++) {
      const dayOfYear = startDayOfYear + day - 1;
      const dayData = this.generateDayData(dayOfYear, currentDate);
      month.days.push(dayData);
    }

    // Calculate astronomical events for this month
    month.astronomicalEvents = this.calculateAstronomicalEvents(
      startDayOfYear,
      startDayOfYear + 29
    );

    return month;
  }

  // Generate data for intercalary period
  generateIntercalaryData(name, afterMonth, currentDate) {
    const intercalary = {
      name: name,
      afterMonth: afterMonth,
      days: [],
      astronomicalEvents: [],
    };

    // Calculate start day of year for this intercalary
    let startDayOfYear = 1;
    for (let m = 1; m <= afterMonth; m++) {
      startDayOfYear += 30; // Each month has 30 days
      // Add intercalary days after months 4, 8
      if (m === 4 || m === 8) {
        startDayOfYear += 5;
      }
    }

    // Generate 5 days for this intercalary
    for (let day = 1; day <= 5; day++) {
      const dayOfYear = startDayOfYear + day - 1;
      const dayData = this.generateDayData(dayOfYear, currentDate);
      intercalary.days.push(dayData);
    }

    // Calculate astronomical events for this intercalary
    intercalary.astronomicalEvents = this.calculateAstronomicalEvents(
      startDayOfYear,
      startDayOfYear + 4
    );

    return intercalary;
  }

  // Generate data for a single day
  generateDayData(dayOfYear, currentDate) {
    const absoluteDay = window.AthasianCalendarCore.toAbsoluteDays(
      currentDate.kingsAge,
      currentDate.yearInAge,
      dayOfYear
    );

    const moonData = this.foundryDarkSunCalendar.calendar.moonSystem.getBothMoons(
      absoluteDay
    );
    const eclipseInfo = this.foundryDarkSunCalendar.calendar.eclipseCalculator.getEclipseInfo(
      absoluteDay
    );

    return {
      dayOfYear: dayOfYear,
      absoluteDay: absoluteDay,
      isCurrentDay: dayOfYear === currentDate.dayOfYear,
      moonData: moonData,
      eclipseInfo: eclipseInfo,
      events: this.getDayEvents(dayOfYear, moonData, eclipseInfo),
    };
  }

  // Get astronomical events for a day
  getDayEvents(dayOfYear, moonData, eclipseInfo) {
    const events = [];

    // Check for eclipses
    if (eclipseInfo.type !== "none") {
      events.push({
        type: "eclipse",
        symbol: "🌙",
        description: `${eclipseInfo.type} Eclipse`,
        severity: "major",
      });
    }

    // Check for moon oppositions (moons opposite each other)
    const ralPhase = moonData.ral.phase;
    const guthayPhase = moonData.guthay.phase;

    if (
      Math.abs(ralPhase - guthayPhase) >= 0.4 &&
      Math.abs(ralPhase - guthayPhase) <= 0.6
    ) {
      events.push({
        type: "opposition",
        symbol: "🌟",
        description: "Moon Opposition",
        severity: "minor",
      });
    }

    // Check for moon conjunctions (moons together)
    if (
      Math.abs(ralPhase - guthayPhase) <= 0.1 ||
      Math.abs(ralPhase - guthayPhase) >= 0.9
    ) {
      events.push({
        type: "conjunction",
        symbol: "🌑",
        description: "Moon Conjunction",
        severity: "minor",
      });
    }

    // Check for full moons
    if (ralPhase >= 0.45 && ralPhase <= 0.55) {
      events.push({
        type: "full-moon-ral",
        symbol: "🌕",
        description: "Ral Full Moon",
        severity: "minor",
      });
    }

    if (guthayPhase >= 0.45 && guthayPhase <= 0.55) {
      events.push({
        type: "full-moon-guthay",
        symbol: "🌕",
        description: "Guthay Full Moon",
        severity: "minor",
      });
    }

    // Check for new moons
    if (ralPhase <= 0.05 || ralPhase >= 0.95) {
      events.push({
        type: "new-moon-ral",
        symbol: "🌑",
        description: "Ral New Moon",
        severity: "minor",
      });
    }

    if (guthayPhase <= 0.05 || guthayPhase >= 0.95) {
      events.push({
        type: "new-moon-guthay",
        symbol: "🌑",
        description: "Guthay New Moon",
        severity: "minor",
      });
    }

    return events;
  }

  // Calculate astronomical events for a date range
  calculateAstronomicalEvents(startDay, endDay) {
    const events = [];

    for (let day = startDay; day <= endDay; day++) {
      const absoluteDay = window.AthasianCalendarCore.toAbsoluteDays(
        this.foundryDarkSunCalendar.calendar.currentState.kingsAge,
        this.foundryDarkSunCalendar.calendar.currentState.yearInAge,
        day
      );

      const moonData = this.foundryDarkSunCalendar.calendar.moonSystem.getBothMoons(
        absoluteDay
      );
      const eclipseInfo = this.foundryDarkSunCalendar.calendar.eclipseCalculator.getEclipseInfo(
        absoluteDay
      );

      const dayEvents = this.getDayEvents(day, moonData, eclipseInfo);

      if (dayEvents.length > 0) {
        events.push({
          day: day,
          events: dayEvents,
        });
      }
    }

    return events;
  }

  // Static method for button action
  static async _onAdvanceDay(event, target) {
    if (game.user.isGM) {
      await globalThis.DSC.advanceDays(1);
      ui.notifications.info("Advanced 1 day");
      this.render(false);
    } else {
      ui.notifications.warn("Only GMs can advance time");
    }
  }

  // Static method for showing grid
  static async _onShowGrid(event, target) {
    // Toggle grid view
    const container = target.closest(".dsc-calendar-container");
    const gridView = container.querySelector(".calendar-grid-view");
    const detailView = container.querySelector(".calendar-detail-view");

    if (gridView.style.display === "none") {
      gridView.style.display = "block";
      detailView.style.display = "none";
      target.textContent = "Show Details";
    } else {
      gridView.style.display = "none";
      detailView.style.display = "block";
      target.textContent = "Show Grid";
    }
  }

  // Static method for showing day details
  static async _onShowDetails(event, target) {
    const dayOfYear = parseInt(target.dataset.day);
    if (dayOfYear) {
      // Show detailed information for this day
      const currentDate = globalThis.DSC.getCurrentDate();
      const absoluteDay = window.AthasianCalendarCore.toAbsoluteDays(
        currentDate.kingsAge,
        currentDate.yearInAge,
        dayOfYear
      );

      const moonData = globalThis.foundryDarkSunCalendar.calendar.moonSystem.getBothMoons(
        absoluteDay
      );
      const eclipseInfo = globalThis.foundryDarkSunCalendar.calendar.eclipseCalculator.getEclipseInfo(
        absoluteDay
      );

      let details = `<h3>Day ${dayOfYear} Details</h3>`;
      details += `<p><strong>Ral Moon:</strong> ${
        moonData.ral.phaseName
      } (${Math.round(moonData.ral.illumination)}%)</p>`;
      details += `<p><strong>Guthay Moon:</strong> ${
        moonData.guthay.phaseName
      } (${Math.round(moonData.guthay.illumination)}%)</p>`;

      if (eclipseInfo.type !== "none") {
        details += `<p><strong>Eclipse:</strong> ${eclipseInfo.type} - ${eclipseInfo.description}</p>`;
      }

      new Dialog({
        title: `Athasian Calendar - Day ${dayOfYear}`,
        content: details,
        buttons: {
          close: {
            label: "Close",
          },
        },
      }).render(true);
    }
  }

  // Required method for ApplicationV2 - renders the HTML content
  async _renderHTML(context, options) {
    const currentDate = context.currentDate;
    const calendarGrid = context.calendarGrid;

    // Fallbacks for intercalary and season
    const intercalaryLabel =
      currentDate.intercalaryName || "Intercalary Period";
    const intercalaryDesc = currentDate.intercalary
      ? this.foundryDarkSunCalendar.calendar.getIntercalaryDescription(
          currentDate.intercalary
        )
      : "";
    const seasonLabel = currentDate.season.name || "Between Seasons";

    return `
      <div style="text-align: center; padding: 10px;">
        <h2>📅 ${currentDate.yearName}</h2>
        
        <!-- Detail View -->
        <div class="calendar-detail-view">
          <p><strong>King's Age:</strong> ${
            currentDate.kingsAge
          }, <strong>Year:</strong> ${currentDate.yearInAge}</p>
          <p><strong>Day:</strong> ${currentDate.dayOfYear} of 375</p>
          ${
            currentDate.monthName
              ? `<p><strong>Month:</strong> ${currentDate.monthName}, Day ${currentDate.dayInMonth}</p>`
              : `<p><strong>Intercalary:</strong> ${intercalaryLabel}, Day ${currentDate.dayInIntercalary}<br><em>${intercalaryDesc}</em></p>`
          }
          <p><strong>Season:</strong> ${seasonLabel}</p>
          <hr>
          <h3>🌙 Moon Phases</h3>
          <p><strong>Ral (Green):</strong> ${
            currentDate.moons.ral.phaseName
          } (${currentDate.moons.ral.illumination}%)</p>
          <p><strong>Guthay (Golden):</strong> ${
            currentDate.moons.guthay.phaseName
          } (${currentDate.moons.guthay.illumination}%)</p>
          ${
            currentDate.eclipse.type !== "none"
              ? `<hr><div style="color: #d4af37;"><h3>🌙 Eclipse Event</h3><p>${currentDate.eclipse.description}</p></div>`
              : ""
          }
        </div>

        <!-- Grid View -->
        <div class="calendar-grid-view" style="display: none;">
          <div class="calendar-grid-container">
            ${this.renderCalendarGrid(calendarGrid, currentDate)}
          </div>
        </div>

        <hr>
        <div class="calendar-controls">
          <button type="button" data-action="advanceDay" ${
            !context.isGM ? "disabled" : ""
          }>
            Advance 1 Day
          </button>
          <button type="button" data-action="showGrid">
            Show Grid
          </button>
        </div>
      </div>
    `;
  }

  // Render the calendar grid
  renderCalendarGrid(grid, currentDate) {
    let html = '<div class="calendar-grid">';

    // Render months
    grid.months.forEach((month, index) => {
      html += this.renderMonthGrid(month, currentDate);

      // Add intercalary after months 4, 8
      if (month.number === 4 || month.number === 8) {
        const intercalaryIndex = month.number === 4 ? 0 : 1;
        html += this.renderIntercalaryGrid(
          grid.intercalary[intercalaryIndex],
          currentDate
        );
      }
    });

    // Add final intercalary after month 12
    html += this.renderIntercalaryGrid(grid.intercalary[2], currentDate);

    html += "</div>";
    return html;
  }

  // Render a month grid
  renderMonthGrid(month, currentDate) {
    let html = `
      <div class="month-grid">
        <h3>${month.name}</h3>
        <div class="month-days">
    `;

    // Render 30 days in a 6x5 grid
    for (let week = 0; week < 5; week++) {
      html += '<div class="week">';
      for (let dayOfWeek = 0; dayOfWeek < 6; dayOfWeek++) {
        const dayIndex = week * 6 + dayOfWeek;
        if (dayIndex < month.days.length) {
          const day = month.days[dayIndex];
          html += this.renderDayCell(day, currentDate);
        }
      }
      html += "</div>";
    }

    html += "</div></div>";
    return html;
  }

  // Render an intercalary grid
  renderIntercalaryGrid(intercalary, currentDate) {
    let html = `
      <div class="intercalary-grid">
        <h3>${intercalary.name}</h3>
        <div class="intercalary-days">
    `;

    // Render 5 days in a single row
    html += '<div class="week">';
    intercalary.days.forEach((day) => {
      html += this.renderDayCell(day, currentDate);
    });
    html += "</div>";

    html += "</div></div>";
    return html;
  }

  // Render a single day cell
  renderDayCell(day, currentDate) {
    const isCurrent = day.isCurrentDay;
    const hasEvents = day.events.length > 0;

    let html = `<div class="day-cell ${isCurrent ? "current" : ""} ${
      hasEvents ? "has-events" : ""
    }" data-day="${day.dayOfYear}" data-action="showDetails">`;

    html += `<div class="day-number">${day.dayOfYear}</div>`;

    if (hasEvents) {
      html += '<div class="day-events">';
      day.events.forEach((event) => {
        html += `<span class="event-symbol" title="${event.description}">${event.symbol}</span>`;
      });
      html += "</div>";
    }

    html += "</div>";
    return html;
  }

  // Required method for ApplicationV2 - handles replacing HTML in the DOM
  async _replaceHTML(result, content, options) {
    // Default implementation - just replace the content
    content.innerHTML = result;
  }
}

// Register globally for access
window.DarkSunCalendarApp = DarkSunCalendarApp;
console.log(
  "DarkSunCalendarApp script loaded successfully",
  DarkSunCalendarApp
);
