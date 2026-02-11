import { ContentEditable } from "./ContentEditable";
import CheckIcon from "./icons/check";
import CrossIcon from "./icons/Cross";
import UndoIcon from "./icons/Undo";
import MoreActions from "./MoreActions";

const AgendaCard = ({
  keyId,
  index,
  title,
  status,
  description,
  onMenuClick,
  onCheckClick,
  onRemoveClick,
}) => {

  const moreActions = [
    ["Update Reminder",
      function updateRem(idx, e) {
        console.log('Updating reminder', idx);
      }],
    ["Add/Update Description",
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
  const handleOnInput = function (target) {
    console.log('in on input', target);
  };
  const handleOnBlur = function (target) {
    console.log('in on blur', target);
  };

  return (
    <div key={keyId} className="relative group card bg-base-100 shadow-md border border-base-300 mb-2">
      <div className="card-body p-4">
        {/* Top icon row */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-base-content/60 font-medium">
            Rem 4:30 PM</span>
          <div className="flex items-center gap-[2px] mb-1 border-b border-base-300 opacity-0 group-hover:opacity-100 transition-opacity">

            <MoreActions key={keyId} actions={moreActions} />
            {/* <button
              className="btn btn-ghost btn-xs px-1 min-w-0 text-base-content/70 hover:text-base-content"
              onClick={onMenuClick}
              aria-label="More options"
            >
              <svg className="w-5 h-5" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeWidth="2"
                  d="M6 12h.01m6 0h.01m5.99 0h.01" />
              </svg>
            </button> */}

            <button
              title={"Mark this " + (isMarkDone() ? "undone." : "done.")}
              className="btn btn-ghost btn-xs px-1 min-w-0 text-info/70 hover:text-info"
              onClick={(e)=> onCheckClick(index, e)}
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
        <div className={isMarkDone() ? "transition-all duration-200 opacity-40 pointer-events-none": undefined}>
        {/* Content */}
        <ContentEditable key={keyId}
          value={title}
          onBlur={handleOnBlur}
          onChange={handleOnInput}>
          <h2 className="text-lg font-bold leading-snug tracking-tight">
            {title}
          </h2>
        </ContentEditable>
        <ContentEditable>
        <p className="text-md text-base-content/80 mt-1">
          {description}
        </p>
        </ContentEditable>
        </div>
      </div>
    </div>
    // <div className="card mb-2 bg-base-100 shadow-md border border-base-300">
    //   <div className="card-body p-2 pt-2">
    //     {/* Header */}
    //     <div className="flex items-start justify-between gap-2">
    //       <h2 className="text-lg font-bold leading-tight pr-1">
    //         {title}
    //       </h2>

    //       <div className="flex items-center gap-[2px] shrink-0">
    //         <button
    //           className="btn btn-ghost btn-xs px-1 min-w-0"
    //           onClick={onMenuClick}
    //           aria-label="More options"
    //         >
    //           <svg className="w-5 h-5" aria-hidden="true"
    //                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    //                   <path stroke="currentColor" strokeLinecap="round" strokeWidth="2"
    //                     d="M6 12h.01m6 0h.01m5.99 0h.01" />
    //                 </svg>
    //         </button>

    //         <button
    //           className="btn btn-ghost btn-xs px-1 min-w-0"
    //           onClick={onCheckClick}
    //           aria-label="Select"
    //         >
    //           <CheckIcon className="w-5 h-5" />
    //         </button>

    //         <button
    //           className="btn btn-ghost btn-xs text-error px-1 min-w-0"
    //           onClick={onCloseClick}
    //           aria-label="Remove"
    //         >
    //           <svg
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   className="h-5 w-5"
    //                   fill="none"
    //                   viewBox="0 0 24 24"
    //                   stroke="currentColor">
    //                   <path
    //                     strokeLinecap="round"
    //                     strokeLinejoin="round"
    //                     strokeWidth="2"
    //                     d="M6 18L18 6M6 6l12 12" />
    //                 </svg>
    //         </button>
    //       </div>
    //     </div>

    //     {/* Description */}
    //     <p className="text-sm text-base-content/80 mt-2">
    //       {description}
    //     </p>
    //   </div>
    // </div>
  );
};

export default AgendaCard;
