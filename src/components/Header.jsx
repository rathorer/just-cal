import React, { useRef, useState } from "react";
import ThemeLightIcon from "./icons/ThemeLight";
import ThemeDarkIcon from "./icons/ThemeDark";
import BarsIcon from "./icons/Bars";
import PrevIcon from "./icons/Prev";
import NextIcon from "./icons/Next";
import MoreActions from "./MoreActions";
import { UserSettings } from "../utilities/UserSettings";
import HomeIcon from "./icons/Home";

export default function Header(props) {
  const {
    monthName,
    year,
    currentView,
    nextPrevText,
    handlePrev,
    handleNext,
    handleView,
    toggleTheme,
    theme,
    activePage,
    setActivePage,
    setOpenSettings,
    handleHomeClick,
  } = props;

  const buttonRef = useRef(null);
  const [active, setActive] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((isOpen) => !isOpen);
  };

  function toHome(idx, e) {
    setActivePage("Home");
    handleHomeClick();
  }
  function openSettings(idx, e) {
    setOpenSettings(true);
    console.log("Setting changed");
  }
  function openHelp(idx, e) {
    console.log('help page')
  }
  function openFeedback(idx, e) {
  }
  const menuOptions = [
    //["Home", toHome],
    ["Settings", openSettings],
    ["Help", openHelp],
    ["Feedback/Suggestions", openFeedback]
    //["About", openAbout],
  ];
  const menuItemsBottom = [
    ["Support App", openHelp],
    ["About", openHelp]
  ];
  const handleActionClick = (e, callback, idx) => {
    callback(e, idx);
    setActivePage(menuOptions[idx][0]);
    setTimeout(()=> {setMenuOpen(false)}, 500);
    // Close dropdown by clicking the button
    // if (buttonRef.current) {
    //   buttonRef.current.click();
    // }
  };
  const handleBottomActionClick = (e, callback, idx) => {
    callback(e, idx);
    setActivePage(menuItemsBottom[idx][0]);
    setTimeout(()=> {setMenuOpen(false)}, 500);
  };

  return (
    <div className="flex flex-col">
      <div className="h-10 shadow-md flex items-center px-3 bg-gradient-to-r from-dark-teal via-blue/70 to-dark-teal/90 text-header-teal-content border-b border-teal-700/30">
        {/* <div className="h-10 shadow-md flex items-center px-3 bg-gradient-to-r from-teal-900 via-teal-700 to-teal-800 text-base-content dark:text-white border-b border-orange-700/30"> */}
        <div className="flex justify-start basis-4/5 w-full">
          <div className="flex items-center gap-4">
            <button
              name="previous"
              title={"Previous " + nextPrevText}
              className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
              onClick={handlePrev}
              aria-label="Previous">
              <PrevIcon />
            </button>
          </div>
          <div className="flex justify-center flex-1">
            <button
              title={currentView === 1 ? "Change to year view" : "Change to month view"}
              className="btn btn-ghost btn-sm p-2 min-w-0"
              onClick={handleView}
              aria-label="Next"
            >
              <h1 className="text-lg font-bold m-0 leading-none">
                {currentView === 1 ? `${monthName} ${year}` : year}
              </h1>
            </button>
          </div>
          <div className="flex items-center justify-end gap-4">
            <button
              name="next"
              title={"Next " + nextPrevText}
              className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
              onClick={handleNext}
              aria-label="Next"
            >
              <NextIcon />
            </button>
          </div>
        </div>
        <div className="basis-1/5 flex justify-end gap-2">
          <div className="flex items-center justify-end gap-4"></div>
          <button
            name="themeChange"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
            onClick={toggleTheme}
            aria-label="Change theme"
          >
            {theme === "light" ? <ThemeLightIcon /> : <ThemeDarkIcon />}
          </button>
          <button
            name="home"
            title="Go to running month"
            className="btn btn-ghost btn-sm p-2 min-w-0 hover:text-blue"
            onClick={toHome}
            aria-label="Go to home"
          >
            <HomeIcon className="w-6 h-6" />
          </button>
          <div className={`dropdown dropdown-end ${menuOpen ? "dropdown-open" : "dropdown-close"}`}>
            <button
              name="menu"
              title="Menu options"
              className="btn btn-ghost btn-sm p-2 min-w-0"
              onClick={toggleMenu}
              aria-label="Menu options"
            >
              <BarsIcon ref={buttonRef} /></button>
            <ul
              tabIndex={0}
              className="dropdown-content menu menu-md bg-base-100 shadow-lg border border-base-300 rounded-md w-auto z-[100]"
            >
              {menuOptions.map((action, idx) =>
                <li key={"top-" + idx}>
                  <button className={"btn btn-ghost text-sm " + ((activePage === action[0]) ? "menu-active" : "font-normal")}
                    onClick={(e) => handleActionClick(e, action[1], idx)}>
                    {action[0]}
                  </button>
                </li>
              )}
              <div className="divider my-3"></div>
              {menuItemsBottom.map((item, idx) => {
                //const Icon = item.icon;
                return (
                  <li key={"bottom-" + idx}>
                    <button
                      className={"btn btn-ghost text-sm "+ ((activePage === item[0]) ? "menu-active" : "font-normal")}
                      onClick={(e) => handleBottomActionClick(e, item[1], idx)}
                    >
                      {/* <Icon className="w-6 h-6" /> */}
                      {item[0]}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}