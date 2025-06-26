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
      width: 420,
      height: "auto",
    },
    classes: ["dsc-calendar-container"],
    // Define actions for event handling
    actions: {
      advanceDay: DarkSunCalendarApp._onAdvanceDay,
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

    return {
      currentDate,
      isGM: game.user.isGM,
    };
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

  // Required method for ApplicationV2 - renders the HTML content
  async _renderHTML(context, options) {
    const currentDate = context.currentDate;

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
        <p><strong>Ral (Green):</strong> ${currentDate.moons.ral.phaseName} (${
      currentDate.moons.ral.illumination
    }%)</p>
        <p><strong>Guthay (Golden):</strong> ${
          currentDate.moons.guthay.phaseName
        } (${currentDate.moons.guthay.illumination}%)</p>
        ${
          currentDate.eclipse.type !== "none"
            ? `<hr><div style="color: #d4af37;"><h3>🌙 Eclipse Event</h3><p>${currentDate.eclipse.description}</p></div>`
            : ""
        }
        <hr>
        <button type="button" data-action="advanceDay" ${
          !context.isGM ? "disabled" : ""
        }>
          Advance 1 Day
        </button>
      </div>
    `;
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
