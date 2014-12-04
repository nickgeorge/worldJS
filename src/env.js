goog.provide('Env');

Env = {
  world: null,
  hud: null,
  gl: null,
  client: null,
};


Env.setEnvironment = function(world, hud, gl, opt_client) {
  Env.world = world;
  Env.hud = hud;
  Env.gl = gl;
  Env.client = opt_client || null;
};
