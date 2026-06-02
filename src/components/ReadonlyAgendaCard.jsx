import { Constants } from "../utilities/constants";
import { ContentEditable } from "./ContentEditable";
import CheckIcon from "./icons/check";
import CrossIcon from "./icons/Cross";
import UndoIcon from "./icons/Undo";
import MoreActions from "./MoreActions";
import { extractPlainText } from "../utilities/utils";
import TimePicker from "./TimePicker";
import { useRef, useState } from "react";
import { useUserSettings } from "../contexts/UserSettingsContext";

const ReadonlyAgendaCard = ({
  keyId,
  index,
  agendaItem,
  status
}) => {

  const toReadableTime = function (dateTimeISOString) {
    return new Date(dateTimeISOString).toLocaleTimeString(undefined, { timeStyle: Constants.TIME_FORMAT });
  };
  const DESC_BOX_HEIGHT = 6;
  const { settings } = useUserSettings();
  const [updatingTime, setUpdatingTime] = useState(false);
  const [updatingReminder, setUpdatingReminder] = useState(false);
  const [minDescHeight, setMinDescHeight] = useState(DESC_BOX_HEIGHT);
  const [descPlaceholder, setDescPlaceholder] = useState("");
  const titleRef = useRef(null);
  const descRef = useRef(null);

  const itemsDate = new Date(agendaItem.date || "");
  const event = agendaItem.time ? toReadableTime(agendaItem.time) : undefined;
  const reminder = toReadableTime(agendaItem.reminder);
  const ACTIONS = Object.freeze({
    EVENT_TIME: 0,
    REMINDER: 1,
    DESCRIPTION: 2,
    MOVE_ITEM: 3
  });

  const moreActions = [
    ["Move to next day",
      function moveToNextDay(idx, e) {
        console.log("Moving to next day..", idx);
      }]
  ];

  //TODO: This can go to utils, and ultimately we can move it to ContentEditable itself.
  // If ContentEditable knows the inner initial html. 
  // It should extract innerText using that and call parent functions.
  function stringToNode(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim(); // .trim() prevents empty text nodes from whitespace
    return template.content.firstChild;
  }

  const isMarkDone = function () {
    return status && status.toLowerCase() === "done";
  };

  return (
    <div key={keyId} className={`relative group card bg-base-100/90 shadow-md border border-base-300 mb-2 bg-gradient-to-tl from-${settings && settings.backgroundShade}/10 to-base-100`}>
      <div className="card-body px-4 py-2">
        {/* Top icon row */}
        <div className="flex text-xs items-center justify-between">
            <span className="text-xs text-base-content/60 font-medium">
              Date: {itemsDate.getDate()}</span>
          <div className="flex items-center gap-[2px] mb-1 border-b border-base-300 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isMarkDone() && <MoreActions key={keyId} actions={moreActions} />}
          </div>
        </div>
        <div className={isMarkDone() ? "transition-all duration-200 opacity-40 pointer-events-none" : undefined}>
          <div key={keyId}>
            <h2 className="text-lg font-bold leading-snug tracking-tight" ref={titleRef}>
              {agendaItem.title}
            </h2>
          </div>
          <div
            ref={descRef}
            placeholder={descPlaceholder}>
            <div className="text-md text-base-content/80 mt-1"
              style={{ minHeight: `${minDescHeight * 0.25}rem` }}>
              {agendaItem.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadonlyAgendaCard;
