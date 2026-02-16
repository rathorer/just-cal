import { Constants } from "../utilities/constants";
import { ContentEditable } from "./ContentEditable";
import CheckIcon from "./icons/check";
import CrossIcon from "./icons/Cross";
import UndoIcon from "./icons/Undo";
import MoreActions from "./MoreActions";
import { extractPlainText } from "../utilities/utils";

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
    return new Date(dateTimeISOString).toLocaleTimeString(undefined, {timeStyle: Constants.TIME_FORMAT});
  };

  const event = agendaItem.time ? toReadableTime(agendaItem.time): undefined;
  const reminder = toReadableTime(agendaItem.reminder);

  const moreActions = [
    ["Update time",
      function updateTime(idx, e) {
        console.log('Updating time', idx);
      }],
    ["Update reminder",
      function updateRem(idx, e) {
        console.log('Updating reminder', idx);
      }],
    ["Add/Update description",
      function updateDesc(idx, e) {
        console.log("Add or Update description", idx);
      }],
    ["Move this to next day",
      function moveToNextDay(idx, e) {
        console.log("Moving to next day..", idx);
      }]
  ];

  const isMarkDone = function () {
    return status && status.toLowerCase() === "done";
  };

  const handleTitleBlur = (html) => {
    const nextTitle = html;//extractPlainText(html);
    if (nextTitle.length === 0) {
      return;
    }
    onItemUpdate?.(index, { title: nextTitle, user_input: nextTitle });
  };

  const handleDescriptionBlur = (html) => {
    //TODO: here we should be able to take the html as it is, as it is already sanitized.
    const nextDescription = extractPlainText(html);
    onItemUpdate?.(index, { description: nextDescription });
  };

  return (
    <div key={keyId} className="relative group card bg-base-100 shadow-md border border-base-300 mb-2">
      <div className="card-body p-4">
        {/* Top icon row */}
        <div className="flex items-center justify-between">
          {event ?
          <span className="text-xs text-base-content/60 font-medium">
            At {event}</span> : undefined}
          <span className="text-xs text-base-content/60 font-medium">
            Rem: {reminder}</span>
          <div className="flex items-center gap-[2px] mb-1 border-b border-base-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreActions key={keyId} actions={moreActions} />
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
            <h2 className="text-lg font-bold leading-snug tracking-tight">
              {agendaItem.title}
            </h2>
          </ContentEditable>
          <ContentEditable onBlur={handleDescriptionBlur}>
            <p className="text-md text-base-content/80 mt-1">
              {agendaItem.description}
            </p>
          </ContentEditable>
        </div>
      </div>
    </div>
  );
};

export default AgendaCard;
