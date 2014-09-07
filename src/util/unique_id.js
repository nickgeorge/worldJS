goog.provide('UniqueId');

UniqueId = {
  /** @private {number} */
  nextValue_: 0,

  /** @return {number} */
  generate: function() {
    return UniqueId.nextValue_++;
  }
};
