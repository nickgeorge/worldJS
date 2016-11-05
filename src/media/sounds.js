goog.provide('Sounds');

Audio.prototype.maybePlay = function() {
  this.currentTime = 0;
  if (!Sounds.on) return;
  this.play();
};

Sounds = {
  on: true,

  get: function(sound, opt_callback) {
    var audio = new Audio(sound);
    audio.addEventListener('ended', function() {
      if (opt_callback) opt_callback();
    }, false);

    return audio;
  },

  getAndPlay: function(sound, opt_callback) {
    // console.log("getabd");
    var audio = Sounds.get(sound, opt_callback);

    audio.addEventListener('canplaythrough', function() {
      audio.maybePlay();
    }, false);
  }
}
