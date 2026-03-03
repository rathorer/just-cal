import { memoize } from "../utilities/utils";
import { extractTime } from "../capabilities/eventTimeDetection";

/**
 * 
 * @param {string} text
 * @returns {Date} datetime object 
 */
function getSpecifiedTimePlain(text) {
    return extractTime(text);
}
const getSpecifiedTime = memoize(getSpecifiedTimePlain);

export { getSpecifiedTime }