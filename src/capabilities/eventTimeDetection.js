import { ExtractedTime } from "../utilities/entities";
import { Constants } from "../utilities/constants";
import {getWordWindow } from "../utilities/utils";

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