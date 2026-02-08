import { parseReminder, extractTime, memoize } from "./utils";
import { Constants } from "./constants";
import { ExtractedTime } from "./entities";

/**
 * 
 * @param {string} text
 * @returns {Date} datetime object 
 */
function getReminderPlain(text) {
    let reminder = parseReminder(text);
    let reminderTime, eventTime = null;
    if (reminder.isReminder) {
        reminderTime = reminder.time;
    } else {
        let extractedTime = extractTime(text);
        if (extractedTime && extractedTime.confidence > 0.6) {
            //We are trying to get just time here as we didn't find explicit reminder.
            //Most likely its the exact time of event, so set reminder may be 15 min early.
            eventTime = extractedTime;

            reminderTime = new ExtractedTime(extractedTime.hour,
                extractedTime.minute - Constants.NOTIFY_MINUTES_BEFORE_EVENT,
                extractedTime.isApprox,
                extractedTime.confidence);
                
        } else {
            reminderTime = Constants.DEFAULT_REMIND_TIME;
        }
    }
    return { reminder: reminderTime, event: eventTime };
}
const getReminder = memoize(getReminderPlain);

export { getReminder }