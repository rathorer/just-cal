import SettingsIcon from './components/icons/setting'
import BarsIcon from './components/icons/bars';
import ThemeLightIcon from './components/icons/themeLight';
import ThemeDarkIcon from './components/icons/themeDark';
import Day from './components/Day';
import JustDate from './utilities/justDate';
import { useMemo, useState, useRef } from 'react';
import { useTheme } from './hooks/useTheme';
import { event } from '@tauri-apps/api';
import useWindowWidth from './hooks/useWindowWidth';

function NewApp() {
  const { theme, toggleTheme } = useTheme();
  const [monthDays, setMonthDays] = useState([]);
  const [weekDays, setWeekDays] = useState([]);
  const [monthStart, setMonthStart] = useState(0);
  const [monthName, setMonthName] = useState();
  const width = useWindowWidth();
  console.log(width);
  const month = new Date().getMonth();
  const localeMonth = new JustDate().getMonthName();

  const monthDates = useMemo(() => {
    const currentDate = new JustDate(new Date(), 'en-US');
    const monthDates = currentDate.getMonthDates();
    const monthDays = currentDate.getDayNumbersInMonth();
    const dayNameFormat = width > 700 ? 'long': width > 300 ? 'short': 'narrow';
    const weekDays = currentDate.getLocalizedWeekdays(dayNameFormat);

    let weekInfo = currentDate.getLocaleWeekInfo();//This gives firstDay 1 based, Monday is 1, ..
    const firstDay = weekInfo.firstDay % 7; //To convert into 0 based. Monday is 1, Sunday is 0;
    let firstDayOfMonth = monthDates[0].getDay();
    
    let monthStartOffset = firstDayOfMonth - firstDay;
    setMonthStart(monthStartOffset);
    let emptyDates = Array.from({ length: monthStartOffset }, (v, i) => undefined);
    monthDates.unshift(...emptyDates);
    setMonthDays(monthDays);
    setWeekDays(weekDays);
    setMonthName(localeMonth);

    return monthDates;
  }, [month]); // Dependency array

  // console.log(monthDates);
  // console.log(monthDays);

  const openMenu = () => {
    console.log("Menu Open");
  }

  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  // Store the previous scrollLeft position to determine direction/movement
  const [prevScrollLeft, setPrevScrollLeft] = useState(0);
  const handleDayClick = (event, t) => {
    console.log(event);
    let div = event && event.target.children[0];//.children
    console.log(div.tagName);
    if(div && div.tagName === 'H2'){
      alert(monthName + ' '+ div.innerText);
    }
  };
  const handleWheelScroll = (event) => {
    console.log("trying to scroll");
    if (containerRef.current) {
      // Prevent default vertical scrolling behavior if needed
      event.preventDefault();
      const scrollAmount = event.deltaY; // Use deltaY for vertical wheel movement
      containerRef.current.scrollTo({
        left: containerRef.current.scrollLeft + scrollAmount,
        behavior: 'smooth' // Optional: adds smooth scrolling animation
      });
    }
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      
      if (scrollLeft !== prevScrollLeft) {
        console.log('Horizontal scroll detected! New position:', scrollLeft);
        // You can add your specific logic here (e.g., fetch more data, trigger animation)
      }
      
      // Update the previous position
      setPrevScrollLeft(scrollLeft);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-header-base1">
      {/* <div className="flex items-center justify-center h-screen bg-base-200">
        <button className="btn btn-primary btn-lg border border-red-100">This button should look styled!</button>
      </div> */}
      {/* 1. Top Bar - Thin, fixed height */}
      <div className="h-8 shadow-md flex items-center px-2 border-b border-base-content/20">
        <h1 className="text-xl font-bold text-header-base1-content">{monthName}</h1>
        <div className="ml-auto flex items-center gap-2">
          <a className="link text-header-base1-content hover:text-primary inline-block p-2 rounded hover:bg-base-200/50 cursor-pointer"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? <ThemeLightIcon /> : <ThemeDarkIcon />}
          </a>
          <a className="link text-header-base1-content hover:text-primary inline-block p-2 rounded hover:bg-base-200/50 cursor-pointer"
            onClick={openMenu}>
            <BarsIcon></BarsIcon>
          </a>
        </div>
      </div>

      {/* 2 & 3. Main Content Area - Takes remaining height */}
      <div className="flex flex-1 overflow-hidden" onWheel={handleWheelScroll}>
        {/* 2. Bottom Left Section - 80% width */}
        <div className="w-full lg:w-4/5 bg-base-100 flex flex-col">
          {/* Optional: Inner header or toolbar */}
          <div className="bg-base-200 p-2 border-b border-base-300 text-base-content">
            <div className="grid grid-cols-7 flex-row">
              {weekDays.map((day) => (
                <div className="pl-0 p-2 h-8 text-left font-semibold">{day}</div>
              ))}
            </div>
          </div>

          {/* Main scrollable content */}
          <div className="flex-1 p-2 pt-0 overflow-y-auto">
            <div className="prose max-w-none">

              <div className="grid grid-cols-7 divide-x divide-y divide-base-content/20 text-base-content border border-base-content/20">
                {monthDates.map((date) => (
                  <div 
                    className={"p-2 h-32 flex justify-between " + (date && date.getDayName() === "Sunday" ? 'text-accent' : '')}
                    onClick={handleDayClick}>
                    { date && (
                      <h2 className="text-xl font-bold">{date.getDate()}</h2>)
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right Sidebar - 20% width */}
        <div className="hidden lg:block w-1/5 bg-base-200 border-l border-base-200 text-base-content">
          <div className="p-4 border-b border-base-200">
            <h3 className="font-semibold text-base-content">Sidebar</h3>
            <p className="text-sm text-header-base-content/70">20% width panel</p>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto h-full">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h4 className="card-title text-sm">Item 1</h4>
                <p className="text-xs">Details...</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <h4 className="card-title text-sm">Item 2</h4>
                <p className="text-xs">More info...</p>
              </div>
            </div>
            {/* Add more sidebar items as needed */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewApp