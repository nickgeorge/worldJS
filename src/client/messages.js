goog.provide('Messages');


Messages.readNameMapMessage = function(reader) {
  var nameMap = {};
  var nameMapSize = reader.readInt32();
  for (var i = 0; i < nameMapSize; i++) {
    var id = reader.readInt32();
    var name = reader.readString();
    var unitId = reader.readInt32();
    nameMap[id] = {
      name: name,
      unitId: unitId,
    };
  }
  return nameMap;
};


Messages.readScoreMessage = function(reader) {
  var scoreMap = [];
  var scoreMapSize = reader.readInt32();
  for (var i = 0; i < scoreMapSize; i++) {
    var id = reader.readInt32();
    var score = reader.readInt32();
    scoreMap.push([id, score]);
  }
  return scoreMap;
};
