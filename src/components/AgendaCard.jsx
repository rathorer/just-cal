import { Constants } from "../utilities/constants";
import { ContentEditable } from "./ContentEditable";
import CheckIcon from "./icons/check";
import CrossIcon from "./icons/Cross";
import UndoIcon from "./icons/Undo";
import MoreActions from "./MoreActions";
import { extractPlainText } from "../utilities/utils";
import TimePicker from "./TimePicker";
import { useRef, useState } from "react";

const AgendaCard = ({
  keyId,
  index,
  agendaItem,
  status,
  onMenuClick,
  onCheckClick,
  onRemoveClick,
  onItemUpdate,
}) => {

  const toReadableTime = function (dateTimeISOString) {
    return new Date(dateTimeISOString).toLocaleTimeString(undefined, { timeStyle: Constants.TIME_FORMAT });
  };
  const DESC_BOX_HEIGHT = 6;
  const [updatingTime, setUpdatingTime] = useState(false);
  const [updatingReminder, setUpdatingReminder] = useState(false);
  const [minDescHeight, setMinDescHeight] = useState(DESC_BOX_HEIGHT);
  const [descPlaceholder, setDescPlaceholder] = useState("");
  const titleRef = useRef(null);
  const descRef = useRef(null);

  const event = agendaItem.time ? toReadableTime(agendaItem.time) : undefined;
  const reminder = toReadableTime(agendaItem.reminder);
  const ACTIONS = Object.freeze({
    EVENT_TIME: 0,
    REMINDER: 1,
    DESCRIPTION: 2,
    MOVE_ITEM: 3
  });

  const handleDescFocus = function (e) {
    setMinDescHeight(DESC_BOX_HEIGHT);
    setDescPlaceholder("Add description/more details here..");
  };
  const moreActions = [
    ["Add/Update event time",
      function updateTime(idx, e) {
        if (!isMarkDone()) {
          setUpdatingTime(true);
          console.log('Updating time', idx);
        }
      }],
    ["Add/Update reminder",
      function updateRem(idx, e) {
        if (!isMarkDone()) {
          setUpdatingReminder(true);
          console.log('Updating reminder', idx);
        }
      }],
    ["Add/Update description",
      function updateDesc(idx, e) {
        descRef.current.focus();
        handleDescFocus(e);
        console.log("Add or Update description", idx);
      }],
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

  const handleTitleBlur = (html) => {
    console.log('using sanitized html: ', html.innerText);
    if (html) {
      const htmlNode = stringToNode(html);
      let nextTitle;
      if (htmlNode.nodeType === Node.ELEMENT_NODE) {
        nextTitle = htmlNode.innerText;
      } else if (htmlNode.nodeType === Node.TEXT_NODE) {
        nextTitle = htmlNode.nodeValue;
      } else {
        console.error("Recieved unknown node from content editable.", html);
      }

      if (nextTitle.length === 0) {
        return;
      }
      onItemUpdate?.(index, { title: nextTitle, user_input: nextTitle });
    }
  };

  const handleDescriptionBlur = (html) => {
    let nextDescription;
    if (html) {
      const htmlNode = stringToNode(html);
      //Duplicate code, because we want to add a check for tag type here.
      if (htmlNode.nodeType === Node.ELEMENT_NODE) {
        nextDescription = htmlNode.innerText;
      } else if (htmlNode.nodeType === Node.TEXT_NODE) {
        nextDescription = htmlNode.nodeValue;
      } else {
        console.error("Recieved unknown node from content editable.", html);
      }
    } else {
      nextDescription = "";
      setDescPlaceholder("");
    }
    onItemUpdate?.(index, { description: nextDescription });
  };

  const handleTimeUpdate = function (time) {
    console.log('updating time', time);
    agendaItem.time = time.toISOString();
    setUpdatingTime(false);
    onItemUpdate?.(index, { time: agendaItem.time });
  };

  const handleReminderUpdate = function (time) {
    console.log('updating time', time);
    agendaItem.reminder = time.toISOString();
    setUpdatingReminder(false);
    onItemUpdate?.(index, { reminder: agendaItem.reminder });
  }

  return (
    <div key={keyId} className="relative group card bg-base-200/70 shadow-md border border-base-300 mb-1">
      <div className="card-body px-4 py-2">
        {/* Top icon row */}
        <div className="flex text-xs items-center justify-between">
          {updatingTime && !isMarkDone()
            ? <TimePicker onTimeChange={handleTimeUpdate} selectedTime={agendaItem.time} />
            : (event &&
              <span onDoubleClick={moreActions[0][1]} className="text-xs text-base-content/60 font-medium">
                At {event}</span>)
          }

          {updatingReminder ? <TimePicker onTimeChange={handleReminderUpdate} selectedTime={agendaItem.reminder} />
            : <span onDoubleClick={moreActions[1][1]} className="text-xs text-base-content/60 font-medium">
              Rem: {reminder}</span>}
          <div className="flex items-center gap-[2px] mb-1 border-b border-base-300 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isMarkDone() && <MoreActions key={keyId} actions={moreActions} />}
            <button
              title={"Mark this " + (isMarkDone() ? "undone." : "done.")}
              className="btn btn-ghost btn-xs px-1 min-w-0 text-info/70 hover:text-info"
              onClick={(e) => onCheckClick(index, e)}
              aria-label="Select"
            >
              {isMarkDone() ?
                <UndoIcon className="w-5 h-5"></UndoIcon>
                : <CheckIcon className='w-5 h-5'></CheckIcon>}
            </button>

            <button
              name="removeItem"
              title="Remove this from agenda"
              className="btn btn-ghost btn-xs px-1 min-w-0 text-error/70 hover:text-error"
              onClick={(e) => onRemoveClick(index, e)}
              aria-label="Remove"
            >
              <CrossIcon />
            </button>
          </div>
        </div>
        <div className={isMarkDone() ? "transition-all duration-200 opacity-40 pointer-events-none" : undefined}>
          <ContentEditable key={keyId}
            onBlur={handleTitleBlur}>
            <h2 className="text-lg font-bold leading-snug tracking-tight" ref={titleRef}>
              {agendaItem.title}
            </h2>
          </ContentEditable>
          <ContentEditable
            ref={descRef}
            placeholder={descPlaceholder}
            onBlur={handleDescriptionBlur}
            onFocus={handleDescFocus}>
            <div className="text-md text-base-content/80 mt-1"
              style={{ minHeight: `${minDescHeight * 0.25}rem` }}>
              {agendaItem.description}
            </div>
          </ContentEditable>
        </div>
      </div>
    </div>
  );
};

export default AgendaCard;
