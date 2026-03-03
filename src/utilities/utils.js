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

export function hasTimeContext(sentence, index) {
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

export function getWordWindow(sentence, matchIndex, phraseLength = 1, rangeForward = 3, rangeBackword = 2) {
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

export function to12Hour(hour24) {
  const meridiem = hour24 >= 12 ? 'pm' : 'am';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, meridiem };
};

export function to24Hour(hour, meridiem) {
    let h24 = parseInt(hour, 10);
    if (meridiem.toUpperCase() === 'PM' && h24 !== 12) {
        h24 += 12;
    }
    if (meridiem.toUpperCase() === 'AM' && h24 === 12) {
        h24 = 0;
    }
    // const formattedHour = h.toString().padStart(2, '0');
    // const formattedMinutes = m.toString().padStart(2, '0');
  return h24;
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
      if (tag === 'a' && node.hasAttribute('href')) {
        const hrefVal = node.getAttribute('href');
        if (!/^(https?:|mailto:|tel:)/i.test(hrefVal)
          || !isSafeHref(hrefVal)) {
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