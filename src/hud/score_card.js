goog.provide('ScoreCard');


/**
 * @constructor
 * @extends {Widget}
 * @struct
 */
ScoreCard = function(x, y) {
  goog.base(this, x, y);
};
goog.inherits(ScoreCard, Widget);


ScoreCard.prototype.render = function() {
  this.setFont('bold 28px courier');

  Env.world.scoreMap.sort(function(a, b) {
    return a[2] < b[2];
  });

  for (var i = 0; i < Env.world.scoreMap.length; i++) {
    var id = Env.world.scoreMap[i][0];
    var value = Env.world.scoreMap[i][1];
    var playerInfo = Env.world.nameMap[id];
    var name = Env.world.nameMap[id].name;
    if (!Env.world.getThing(playerInfo.unitId)) return;

    var color = playerInfo.unitId == -1 ?
        vec4.CYAN :
        Env.world.getThing(playerInfo.unitId).color;

    this.setFillStyle('rgb(' +
        Math.floor(color[0] * 256) + ',' +
        Math.floor(color[1] * 256) + ',' +
        Math.floor(color[2] * 256) + ')');
    this.context.fillText(name + " : " + value,
        this.position[0], this.position[1] + i*25);
  }
};

