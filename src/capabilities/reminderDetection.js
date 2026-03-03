import { getWordWindow, to24Hour } from "../utilities/utils";
import { ExtractedTime } from "../utilities/entities";
import { Constants } from "../utilities/constants";

const NEAR_BY_FORWARD_RANGE = 4;
const NEAR_BY_BACKWARD_RANGE = 2;

function getTimeParts(match) {
  let hour = parseInt(match.groups.hour, 10);
  let minute = match.groups.minute
    ? parseInt(match.groups.minute, 10)
    : 0;
  let meridiem = match.groups.meridiem || null;
  // Infer AM/PM using contextual words
  if (!meridiem) {
    if (/\b(evening|night)\b/.test(text)) meridiem = "pm";
    if (/\b(morning)\b/.test(text)) meridiem = "am";
  }
  // Convert 12h to 24h if needed
  hour = to24Hour(hour, meridiem);
  return { hour, minute };
}

export function parseReminder(inputText) {
  if (!inputText || typeof inputText !== "string") {
    return { isReminder: false, time: null };
  }

  let sentences = inputText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  let reminderSentence = null;
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].toLowerCase();
    const isReminder = Constants.REMINDER_INTENT_REGEX.test(sentence);
    if (isReminder) {
      reminderSentence = sentence;
      break;
    }
  }

  if (!reminderSentence) {
    return { isReminder: false, time: null, confidence: 0.9 };
  }

  let reminderMatch = reminderSentence.match(Constants.REMINDER_INTENT_REGEX);

  let phraseLength = reminderMatch[0].split(/\s+/).length;


  //Get time
  const TIME_REGEX =
    /\b(?:at|around|by|before|after|near|past|to|about|roughly|approximately|approx|almost|nearly)?\s*(?<hour>[0-1]?\d|2[0-3])(?::(?<minute>[0-5]\d))?\s*(?<meridiem>am|pm)?\b/i
  const TIME_REGEX_GLOBAL = new RegExp(TIME_REGEX, 'ig');

  const allMatches = [...reminderSentence.matchAll(TIME_REGEX_GLOBAL)];
  let match = null;
  let lowestTime = null;
  let nearByWordsMatch;
  let nearByWords = getWordWindow(reminderSentence, reminderMatch.index, phraseLength, NEAR_BY_FORWARD_RANGE, NEAR_BY_BACKWARD_RANGE);
  if (allMatches.length > 1) {
    //reminder sentence has more than one time. Lets try nearby word search.
    let matches = allMatches.length;
    
    nearByWordsMatch = nearByWords.match(TIME_REGEX_GLOBAL).length;
    //In most cases if there are 2 times, the lower one should be the reminder.
    //If nearby words also find more than 1 time, lets take the lower one
    if (nearByWordsMatch == 0 || nearByWordsMatch > 1) {
      //nearby words either doesn't have match or more than 1 match, get lowest time of allMatches
      const allTimes = [];
      for (let m of allMatches) {
        allTimes.push(getTimeParts(m));
      }
      lowestTime = allTimes.reduce((time, min) => {
        if (time.hour < min.hour || (time.hour == min.hour && time.minute < min.minute)) {
          return time;
        } else {
          return min;
        }
      }, { hour: 23, minute: 59 });

    } else {
      match = nearByWords.match(TIME_REGEX);
    }
  } else {
    match = reminderSentence.match(TIME_REGEX);
  }
  let confidence = 0.7;
  const { hour, minute } = lowestTime || getTimeParts(match);
  if (match) {
    if (!match || !match.groups) {
      return { isReminder: true, time: null, confidence: 0.9 };
    }
    if (match && nearByWordsMatch && match.index === nearByWordsMatch.index) {
      confidence = 0.95;
    }
  }

  // Final validation
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.warn('Reminder detected, but not a valid time.');
    return { isReminder: true, time: null };
  }
  return {
    isReminder: true,
    time: new ExtractedTime(hour, minute, false, confidence, "reminder")
  };
}