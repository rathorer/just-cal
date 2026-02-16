import { Constants } from "./constants";
import { ExtractedTime } from "./entities";


function memoize(func) {
  const memo = new Map();
  return function (...args) {
    console.log(args);
    let key = JSON.stringify(args);
    console.log("key", key);
    if (memo.has(key)) {
      return memo.get(key);
    } else {
      let resp = func.apply(this, args);
      memo.set(key, resp);
      return resp;
    }
  };
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

  let nearByWords = getWordWindow(reminderSentence, reminderMatch.index, phraseLength, 4, 2);
  //Get time
  const TIME_REGEX =
    /\b(?:at|around|by|before|after)?\s*(?<hour>[0-1]?\d|2[0-3])(?::(?<minute>[0-5]\d))?\s*(?<meridiem>am|pm)?\b/i

  const match = reminderSentence.match(TIME_REGEX);
  const matchNearByWords = nearByWords.match(TIME_REGEX);

  if (!match || !match.groups) {
    return { isReminder: true, time: null, confidence: 0.9 };
  }
  let confidence = 0.7;
  if (match.index === matchNearByWords.index) {
    confidence = 0.95;
  }
  let hour = parseInt(match.groups.hour, 10);
  let minute = match.groups.minute
    ? parseInt(match.groups.minute, 10)
    : 0;
  let meridiem = match.groups.meridiem || null;

  /* ---------------- NORMALIZATION ---------------- */

  // Infer AM/PM using contextual words
  if (!meridiem) {
    if (/\b(evening|night)\b/.test(text)) meridiem = "pm";
    if (/\b(morning)\b/.test(text)) meridiem = "am";
  }

  // Convert 24h to 12h if needed
  if (!meridiem && hour >= 13) {
    hour -= 12;
    meridiem = "pm";
  }

  // Final validation
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    console.warn('Reminder detected, but not a valid time.');
    return { isReminder: true, time: null };
  }
  return {
    isReminder: true,
    time: new ExtractedTime(hour, minute, false, confidence, "reminder")
  };
}

function hasTimeContext(sentence, index) {
  const TIME_PREP_APPROX_REGEX =
    /\b(at|around|by|before|after|near|past|to|about|roughly|approximately|approx|almost|nearly)\b/i;
  const TIME_ACTION_REGEX =
    /\b(remind|notify|alert|schedule|set|start|begin|end|finish|meet|call|join|arrive|leave|depart)\b/i;
  const words = sentence.split(/\s+/);
  const pos = words.findIndex(w => w.includes(index));

  const window = words
    .slice(Math.max(0, pos - 3), pos + 4)
    .join(' ');

  return (
    TIME_PREP_APPROX_REGEX.test(window) ||
    TIME_ACTION_REGEX.test(window)
  );
}

function getWordWindow(sentence, matchIndex, phraseLength = 1, rangeForward = 3, rangeBackword = 2) {
  const words = sentence.split(/\s+/);
  let charCount = 0;
  let wordIndex = 0;

  for (let i = 0; i < words.length; i++) {
    charCount += words[i].length + 1;
    if (charCount > matchIndex) {
      wordIndex = i;
      break;
    }
  }


  return words
    .slice(Math.max(0, wordIndex - rangeBackword), wordIndex + phraseLength + rangeForward)
    .join(' ');
}


export function normalizeTime(raw) {
  raw = raw.toLowerCase().trim();

  // 16:30
  if (raw.includes(':')) {
    const [h, m] = raw.split(':').map(Number);
    return { hour: h, minute: m, isApprox: false };
  }

  // 1600 hours
  if (raw.includes('hours')) {
    const n = parseInt(raw, 10);
    return { hour: Math.floor(n / 100), minute: n % 100, isApprox: false };
  }

  // 4pm / 11 am
  if (raw.includes('am') || raw.includes('pm')) {
    let hour = parseInt(raw, 10);
    if (raw.includes('pm') && hour !== 12) hour += 12;
    if (raw.includes('am') && hour === 12) hour = 0;
    return { hour, minute: 0, isApprox: false };
  }

  // noon / midnight
  if (raw === 'noon' || raw === 'midday')
    return { hour: 12, minute: 0, isApprox: false };

  if (raw === 'midnight')
    return { hour: 0, minute: 0, isApprox: false };

  // bare number fallback
  return { hour: parseInt(raw, 10), minute: 0, isApprox: true };
};

export function extractTimeOld(sentence) {
  const TIME_BARE_NUMBER_REGEX =
    /\b([1-9]|1[0-9]|2[0-3])\b/;

  // 1. Explicit time → STRONG
  const explicit = sentence.match(TIME_EXPLICIT_REGEX);
  if (explicit) {
    return {
      time: explicit[0],
      strength: 'strong',
      reason: 'explicit-format'
    };
  }
  const bare = sentence.match(TIME_BARE_NUMBER_REGEX);
  if (bare) {
    const idx = bare.index;
    const hasContext = hasTimeContext(sentence, idx);

    if (hasContext) {
      return {
        time: bare[0],
        strength: 'strong',
        reason: 'context-validated'
      };
    }

    return {
      time: bare[0],
      strength: 'weak',
      reason: 'bare-number'
    };
  }

  const natural = sentence.match(
    /\b(noon|midday|midnight|morning|afternoon|evening|night)\b/i
  );

  if (natural) {
    return {
      time: natural[0],
      strength: 'weak',
      reason: 'natural'
    };
  }
  return null;
};

/**
 * 
 * @param {*} sentence natural language sentence
 * @returns {ExtractedTime} Extracted time object with hour, minute, source information, along with confidence.
 */
export function extractTime(sentence) {
  // 1. Explicit time
  const explicit = sentence.match(Constants.TIME_EXPLICIT_REGEX);
  if (explicit) {
    return new ExtractedTime(...Object.values(normalizeTime(explicit[0])), 0.95, "explicit");
  }

  // 2. Bare number with validation
  const bare = sentence.match(Constants.TIME_BARE_NUMBER_REGEX);
  if (bare) {
    //bare number is always 1 length
    const window = getWordWindow(sentence, bare.index, 1, 1, 3);

    const hasPrep = Constants.TIME_PREP_APPROX_REGEX.test(window);
    const hasAction = Constants.TIME_ACTION_REGEX.test(window);

    let confidence = 0.55;
    if (hasPrep) confidence = 0.85;
    else if (hasAction) confidence = 0.75;

    return new ExtractedTime(...Object.values(normalizeTime(bare[0]), confidence, "bare"));
  }

  // 3. Natural phrases
  const natural = sentence.match(Constants.TIME_NATURAL_REGEX);
  if (natural) {
    return new ExtractedTime(...Object.values(normalizeTime(natural[0])), 0.65, "natural");
  }

  return null;
};

export function to12Hour(hour24) {
  const meridiem = hour24 >= 12 ? 'pm' : 'am';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, meridiem };
};

export function to24Hour(hour) {

}
function isSafeHref(href) {
  try {
    // Handle relative URLs safely
    const url = new URL(href, window.location.origin);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

export function sanitizeHTML(html,
  allowedTags = Constants.DEFAULT_ALLOWED_TAGS,
  allowedAttributes = Constants.DEFAULT_ALLOWED_ATTRS) {

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return;

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();

      if (!allowedTags.includes(tag)) {
        node.replaceWith(...node.childNodes);
        return;
      }
      if (tag === 'a' && attr.name === 'href') {
        if (!/^(https?:|mailto:|tel:)/i.test(attr.value)
          || !isSafeHref(attr.value)) {
          node.removeAttribute('href');
        }
      }
      // Remove disallowed attributes
      [...node.attributes].forEach(attr => {
        const defaultAllowed = allowedAttributes.default;
        const allowed = allowedAttributes[tag] || [];
        const allAllowed = [...defaultAllowed, ...allowed];
        if (!allAllowed.includes(attr.name)) {
          console.log('removing attr: ', attr.name);
          node.removeAttribute(attr.name);
        }
      })
    }

    [...node.childNodes].forEach(cleanNode);
  }

  [...doc.body.childNodes].forEach(cleanNode);
  return doc.body.innerHTML;
}


/*
* Locale hours, Locale Minutes, locale seconds
*/
export function toISOTimeString(hours, minutes, seconds, meridiem) {
  // Create a new Date object. The specific date part doesn't matter;
  // we only set the time components.

  if (meridiem && meridiem.trim().toLowerCase() === "pm") {
    hours = hours < 12 ? hours + 12 : hours;
  }
  const dateObj = new Date();
  dateObj.setHours(hours);
  dateObj.setMinutes(minutes);
  dateObj.setSeconds(seconds);
  return 'T' + dateObj.toISOString().split('T')[1];
}

/**
 * Safely decode HTML entities to plain text
 * Converts &lt; to <, &gt; to >, &amp; to &, etc.
 * @param {string} html - HTML string with entities
 * @returns {string} Plain text without HTML entities
 */
export function decodeHTMLEntities(html) {
  if (!html) return "";

  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  return textarea.value;
}

/**
 * Extract plain text safely from HTML content
 * Handles both actual HTML tags and encoded HTML entities
 * This prevents displaying &lt; as literal text in the UI
 * @param {string} html - HTML string (may contain encoded entities)
 * @returns {string} Plain text content
 */
export function extractPlainText(html) {
  if (!html) return "";

  // First, decode any HTML entities
  const decoded = decodeHTMLEntities(html);

  //todo: remove regex, and use sanitize html to remove unallowed nodes.
  const plainText = decoded.replace(/<[^>]*>/g, "").trim();

  return plainText;
}

export { memoize };