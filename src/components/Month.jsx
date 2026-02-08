import Day from './Day';
import JustDate from './../utilities/justDate';
import { invoke } from "@tauri-apps/api/core";
import { useMemo, useState, useRef, useEffect } from 'react';
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
  const [monthItems, setMonthItems] = useState([]);
  const width = useWindowWidth();

  const month = JustDate.getMonthIndex(props.month);
  const year = props.year;
  //setSelectedDate(props.date);


  const handleSelectedDate = (date) => {
    // console.log(date);
    if (Number.isInteger(date)) {
      setSelectedDate(date);
    } else {
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


  useEffect(() => {
    async function fetchMonthItems(date) {
      let utcDateStr = date.toISOString();
      let items = await invoke("get_items_for_month", { date: utcDateStr });
      if (items && items.length) {
        let itemsAsObj = Object.fromEntries(items);
        //console.log('get_items_for_month', itemsAsObj);
        setMonthItems(itemsAsObj);
      } else {
        setMonthItems({});
      }
    }
    let date = new Date(year, month, selectedDate);
    fetchMonthItems(date);
  }, [year, month]);

  const isSunday = function (day, index) {
    let isSun = (day.toLowerCase() === "sunday" 
      || day.toLowerCase() === "sun" 
      || (day.toLowerCase === "s" && index === weekDays.indexOf('s')));
    //console.log(isSun);
    return isSun;

  }

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-1 overflow-hidden">
      {/* 2. Bottom Left Section - 80% width */}
      <div className="w-full lg:w-4/5 bg-base-100 flex flex-col">
        {/* Optional: Inner header or toolbar */}
        <div className="pl-3 bg-base-100/90 p-2 border-b border-base-100 text-base-content">
          <div className="grid grid-cols-7 flex-row">
            {weekDays.map((day, idx) => (
              <div key={monthName + day} className={"pl-0 p-2 h-8 text-xl text-center font-semibold"}>{day}</div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-2 pt-0 overflow-y-auto">
          <div className="prose max-w-none">
            <div className="grid grid-cols-7 divide-x divide-y divide-base-content/30 text-base-content/90 border border-base-content/30">
              {monthDates.map((date, idx) => {
                if (date) {
                  let dateKey = new JustDate(date).toDateString();
                  let items = monthItems[dateKey];
                  return <Day key={dateKey}
                    date={date}
                    index={idx}
                    selectedDate={selectedDate}
                    handleSelectedDate={handleSelectedDate}
                    items={items} />
                } else {
                  return <div key={idx} className="p-0 h-42 flex flex-col"></div>
                }
              })}
            </div>
          </div>
        </div>
      </div>
      <RightSection
        year={year} 
        month={month} 
        monthName={monthName} 
        selectedDate={selectedDate} />
    </div >
  )
}

export default Month;