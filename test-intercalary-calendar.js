// Test macro to verify intercalary periods in calendar grid
// Run this macro to test the calendar grid with intercalary periods

console.log('🌞 DSC: Testing intercalary periods in calendar grid...');

// Test different months that should show intercalary periods
const testMonths = [
    { month: 4, name: 'Gather (should show Cooling Sun after)' },
    { month: 8, name: 'Haze (should show Soaring Sun after)' },
    { month: 12, name: 'Smolder (should show Highest Sun after)' },
    { month: 1, name: 'Dust (should not show intercalary)' },
    { month: 6, name: 'Silt (should not show intercalary)' }
];

testMonths.forEach(test => {
    console.log(`\n🌞 DSC: Testing ${test.name} (Month ${test.month})...`);
    
    // Set view date to test month
    const testDate = {
        year: 190,
        month: test.month,
        day: 1,
        weekday: 0,
        time: { hour: 0, minute: 0, second: 0 }
    };
    
    // Open calendar grid for this month
    if (window.DarkSunCalendarGridWidget) {
        window.DarkSunCalendarGridWidget.show(testDate);
        console.log(`🌞 DSC: Opened calendar grid for ${test.name}`);
    } else {
        console.error('🌞 DSC: DarkSunCalendarGridWidget not available');
    }
});

console.log('\n🌞 DSC: Test complete! Check the calendar grid for intercalary periods.');
console.log('🌞 DSC: Expected behavior:');
console.log('  - Month 4 (Gather): Should show Cooling Sun intercalary period after');
console.log('  - Month 8 (Haze): Should show Soaring Sun intercalary period after');
console.log('  - Month 12 (Smolder): Should show Highest Sun intercalary period after');
console.log('  - Other months: Should not show intercalary periods'); 