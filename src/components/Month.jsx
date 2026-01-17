import Day from './Day';
import JustDate from './../utilities/justDate';
import { useMemo, useState, useRef } from 'react';
import { useTheme } from './../hooks/useTheme';
import { event } from '@tauri-apps/api';
import useWindowWidth from './../hooks/useWindowWidth';
import RightSection from './RightSection';


function Month(props) {
  const [monthDays, setMonthDays] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [monthStart, setMonthStart] = useState(0);
  const [monthName, setMonthName] = useState();
  const [selectedDate, setSelectedDate] = useState(props.date);
  const width = useWindowWidth();

  const month = JustDate.getMonthIndex(props.month);
  const year = props.year;
  //setSelectedDate(props.date);

  const handleSelectedDate = (date)=> {
      console.log(date);
    if(Number.isInteger(date)){
      setSelectedDate(date);
    } else{
      console.error('Not a valid date selected.');
    }
  };

  const monthDates = useMemo(() => {
    //if we have month and year defined, initlize the date using them. Else take current date.
    let currentViewDate = (month > -1) && year ? new Date(year, month, selectedDate) : new Date();

    const justDate = new JustDate(currentViewDate, 'en-US');
    const monthDates = justDate.getMonthDates();
    const monthDays = justDate.getDayNumbersInMonth();
    const dayNameFormat = width > 700 ? 'long' : width > 300 ? 'short' : 'narrow';
    const weekDays = justDate.getLocalizedWeekdays(dayNameFormat);
    const localeMonth = justDate.getMonthName();

    let weekInfo = justDate.getLocaleWeekInfo();//This gives firstDay 1 based, Monday is 1, ..
    const firstDay = weekInfo.firstDay % 7; //To convert into 0 based. Monday is 1, Sunday is 0;
    let firstDayOfMonth = monthDates[0].getDay();

    let monthStartOffset = firstDayOfMonth - firstDay;
    setMonthStart(monthStartOffset);
    let emptyDates = Array.from({ length: monthStartOffset }, (v, i) => undefined);
    monthDates.unshift(...emptyDates);

    setMonthDays(monthDays);
    setWeekDays(weekDays);
    setMonthName(localeMonth);
    //setSelectedDate(currentViewDate.getDate());
    //console.log(monthDates);

    return monthDates;
  }, [month, year, width]); // Dependency array


  return (
    <div className="h-[calc(100vh-3rem)] flex flex-1 overflow-hidden">
      {/* 2. Bottom Left Section - 80% width */}
      <div className="w-full lg:w-4/5 bg-base-100 flex flex-col">
        {/* Optional: Inner header or toolbar */}
        <div className="pl-3 bg-base-100/90 p-2 border-b border-base-100 text-base-content">
          <div className="grid grid-cols-7 flex-row ">
            {weekDays.map((day) => (
              <div key={monthName + day} className="pl-0 p-2 h-8 text-xl text-left font-semibold">{day}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-2 pt-0 overflow-y-auto">
          <div className="prose max-w-none">
            <div className="grid grid-cols-7 divide-x divide-y divide-base-content/20 text-base-content border border-base-content/20">
              {monthDates.map((date, idx) => (
                <Day key={idx} date={date} index={idx} selectedDate={selectedDate} handleSelectedDate={handleSelectedDate} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <RightSection month={month} monthName={monthName} year={year} selectedDate={selectedDate} />
    </div >
  )
}

export default Month;