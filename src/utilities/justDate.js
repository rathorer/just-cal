class JustDate extends Date {
    constructor(date = new Date(), locale = 'en-US', weekdayFormat = 'long', monthFormat = 'long') {
        super(date);
        this.locale = locale;
        this.weekdayFormat = weekdayFormat;
        this.monthFormat = monthFormat;
    }
    getDayName() {
        return this.toLocaleDateString(this.locale, { weekday: this.weekdayFormat });
    }
    getMonthName() {
        return this.toLocaleDateString(this.locale, { month: this.monthFormat });
    }
    getYear() {
        return this.getFullYear();
    }
    getLocaleWeekInfo() {
        // weekInfo provides the 'firstDay' (1 for Monday, etc.)
        const weekInfo = new Intl.Locale(this.locale).getWeekInfo();

        return weekInfo; //{ firstDay: 1, weekend: [6, 7], minimalDays: 4 }
    }
    getLocalizedWeekdays() {
        const formatter = new Intl.DateTimeFormat(this.locale, { weekday: this.weekdayFormat });
        // January 1st 2024 was a Monday. We iterate through the next 7 days.
        const firstDayOfWeek = this.getLocaleWeekInfo().firstDay;
        return [...Array(7).keys()].map(dayIndex => {
          const date = new Date(Date.UTC(2024, 0, firstDayOfWeek + dayIndex));
          return formatter.format(date);
        });
    }
    getMonthDates(){
        const month = this.getMonth();
        const year = this.getFullYear();
        const currentDate = new Date(year, month, 1);
        const dates = [];
        while (currentDate.getMonth() === month) {
            dates.push(new JustDate(currentDate)); 
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    }
    getDayNumbersInMonth(year = this.getFullYear(), month = this.getMonth()) {
        // Setting the date to day 0 of the *next* month gets the last day of the *current* month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }
}

export default JustDate