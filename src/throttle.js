/**
 * Throttle. Useful for resize event or scroll
 * @param {Function} fn - the function to be wrapped
 * @param {Number} [limit=300] - only x call for ms
 * @param {Object} [scope=this] - the this object. default to this-generated function
 * @returns {Function} returns the function decorated
 */
export default function throttle(fn, limit = 300, scope) {
  let wait = false;
  return (...args) => {
    const context = scope || this;
    if (!wait) {
      const toReturn = fn.apply(context, args);
      wait = true;
      setTimeout(() => {
        wait = false;
      }, limit);
      return toReturn;
    }
  };
}
