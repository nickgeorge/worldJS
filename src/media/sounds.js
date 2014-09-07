goog.provide('Sounds');


Sounds = {
  get: function(sound, opt_callback) {
    var audio = new Audio(sound);
    audio.addEventListener('ended', function() {
      if (opt_callback) opt_callback();
    }, false);
    return audio;
  },

  getAndPlay: function(sound, opt_callback) {
    var audio = Sounds.get(sound, opt_callback);

    audio.addEventListener('canplaythrough', function() {
      audio.play();
    }, false);
  }
}
