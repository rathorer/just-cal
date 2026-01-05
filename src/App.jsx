import { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import Month from "./components/Month";
import { useTheme } from './hooks/useTheme';
import "./App.css";
import ThemeLightIcon from "./components/icons/themeLight";
import ThemeDarkIcon from "./components/icons/themeDark";
import BarsIcon from "./components/icons/bars";
import JustDate from "./utilities/justDate";
import PrevIcon from "./components/icons/Prev";
import NextIcon from "./components/icons/Next";
import JumpNextIcon from "./components/icons/JumpNext";
import JumpPrevIcon from "./components/icons/JumpPrev";

function App() {
  const LASTMONTH_INDEX = 11; // December;
  const { theme, toggleTheme } = useTheme();
  const [greetMsg, setGreetMsg] = useState("");
  const [monthIndex, setMonthIndex] = useState(-1);
  const [year, setYear] = useState(1969);
  const [monthName, setMonthName] = useState("");
  const [date, setDate] = useState(1);

  useMemo(() => {
    let currentDate;
    if (monthIndex < 0 || year < 1970) {
      currentDate = new Date();
      setMonthIndex(currentDate.getMonth());
      setYear(currentDate.getFullYear());
      setDate(currentDate.getDate());
    } else {
      currentDate = new Date(year, monthIndex, date);
    }
    let justDate = new JustDate(currentDate, "en-US");
    setMonthName(justDate.getMonthName());
  }, [monthIndex, year]);


  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { monthIndex }));
  }
  const openMenu = () => {
    console.log("Menu Open");
  }
  const handlePrevMonth = () => {
    // Ensure the index doesn't go below zero
    if (monthIndex === 0) {
      setYear(year - 1);
      setMonthIndex(LASTMONTH_INDEX);
    } else {
      setMonthIndex(monthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    // Ensure the index doesn't exceed the array length
    if (monthIndex === LASTMONTH_INDEX) {
      setYear(year + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex(monthIndex + 1);
    }
  };
  const handlePrevYear = () => {
      setYear(year - 1);
  };
  const handleNextYear = () => {
      setYear(year + 1);
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
    <main>
      <div className="flex flex-col bg-header-base1">
        <div className="h-8 shadow-md flex items-center px-2 border-b border-base-content/20">

          <a className="link text-header-base1-content hover: text-accent"
            onClick={handlePrevYear}
            disabled={monthIndex === 0 && year === 1970}>
            <JumpPrevIcon />
          </a>
          <a className="link text-header-base1-content hover: text-accent"
            onClick={handlePrevMonth}
            disabled={monthIndex === 0 && year === 1970}
            style={{ opacity: monthIndex === 0 && year === 1970 ? 0.5 : 1 }}>
            <PrevIcon />
          </a>
          <h1 className="text-xl font-bold text-header-base1-content">{monthName} {year}</h1>
          <a className="link text-header-base1-content hover: text-accent"
            onClick={handleNextMonth}>
            <NextIcon />
          </a>
          <a className="link text-header-base1-content hover: text-accent"
            onClick={handleNextYear}>
            <JumpNextIcon />
          </a>
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
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Month month={monthIndex} year={year} />
      </div>

    </main>
  );
}

export default App;
