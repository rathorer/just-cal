import { getSpecifiedTime } from "./eventTimeDetectionService";
import { parseReminder } from "../capabilities/reminderDetection"
import { memoize } from "../utilities/utils";
import { Constants } from "../utilities/constants";
import { ExtractedTime } from "../utilities/entities";

/**
 * 
 * @param {string} text
 * @returns {Date} datetime object 
 */
function getReminderPlain(text) {
    let reminder = parseReminder(text);
    let reminderTime, eventTime = null;
    let extractedTime = getSpecifiedTime(text);

    if (extractedTime && extractedTime.confidence > 0.6) {
        eventTime = extractedTime;
    }
    if (reminder.isReminder) {
        reminderTime = reminder.time || Constants.DEFAULT_REMIND_TIME;
        if (reminder.time == extractedTime) {
            eventTime = null;
        }
    } else if (eventTime) {
        //We found exact time of event, so set reminder 15 min early.
        reminderTime = new ExtractedTime(extractedTime.hour,
            extractedTime.minute - Constants.NOTIFY_MINUTES_BEFORE_EVENT,
            extractedTime.isApprox,
            extractedTime.confidence);
    }
    else {
        reminderTime = Constants.DEFAULT_REMIND_TIME;
    }

    return { reminder: reminderTime, event: eventTime };
}
const getReminder = memoize(getReminderPlain);

export { getReminder }