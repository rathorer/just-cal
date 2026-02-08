import { ExtractedTime } from "./entities";

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]

class JustDate extends Date {
    constructor(date = new Date(), locale = 'en-US', weekdayFormat = 'long', monthFormat = 'long') {
        super(date);
        this.locale = locale;
        this.weekdayFormat = weekdayFormat;
        this.monthFormat = monthFormat;
    }
    static getMonthIndex(month){
        let monthIndex = parseInt(month);
        if(isNaN(monthIndex)){
            month = month.toLowerCase();
            monthIndex = MONTHS.indexOf(month);
            if(monthIndex === -1){
                monthIndex = MONTHS.findIndex(x=> x.startsWith(month));
            }
        }
        return monthIndex;
    }
    getDayName(weekdayFormat = undefined) {
        weekdayFormat = weekdayFormat || this.weekdayFormat;
        return this.toLocaleDateString(this.locale, { weekday: weekdayFormat });
    }
    getMonthName(monthFormat = undefined) {
        monthFormat = monthFormat || this.monthFormat;
        return this.toLocaleDateString(this.locale, { month: monthFormat });
    }
    getYear() {
        return this.getFullYear();
    }
    getLocaleWeekInfo() {
        // weekInfo provides the 'firstDay' (1 for Monday, etc.)
        const weekInfo = new Intl.Locale(this.locale).getWeekInfo();

        return weekInfo; //{ firstDay: 1, weekend: [6, 7], minimalDays: 4 }
    }
    getLocalizedWeekdays(weekdayFormat = undefined) {
        weekdayFormat = weekdayFormat || this.weekdayFormat;
        const formatter = new Intl.DateTimeFormat(this.locale, { weekday: weekdayFormat });
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
    toDateString(){
        const date = this;
        const month = (date.getMonth()+1).toString().padStart(2, 0);
        const year = date.getYear();
        const dayDate = date.getDate().toString().padStart(2, 0);
        return `${year}-${month}-${dayDate}`;
    }
    getDayNumbersInMonth(year = this.getFullYear(), month = this.getMonth()) {
        // Setting the date to day 0 of the *next* month gets the last day of the *current* month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }
    setTime(extractedTime){
   // let currentDate = date;
        if(extractedTime instanceof ExtractedTime){
            const thisDate = this;
            thisDate.setHours(extractedTime.hour);
            thisDate.setMinutes(extractedTime.minute);
        }
        return thisDate;
    }
}

export default JustDate