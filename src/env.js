goog.provide('Env');

Env = {
  world: null,
  hud: null,
  gl: null,
};


/** @suppress {undefinedVars} */
Env.setEnvironment = function(world, hud, gl) {
  Env.world = world;
  Env.hud = hud;
  Env.gl = gl;
};
