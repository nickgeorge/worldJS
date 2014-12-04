goog.provide('Messages');


Messages.readNameMapMessage = function(reader) {
  var nameMap = {};
  var nameMapSize = reader.readInt();
  for (var i = 0; i < nameMapSize; i++) {
    var id = reader.readInt();
    var name = reader.readString();
    var unitId = reader.readInt();
    nameMap[id] = {
      name: name,
      unitId: unitId,
    };
  }
  return nameMap;
};


Messages.readScoreMessage = function(reader) {
  var scoreMap = [];
  var scoreMapSize = reader.readInt();
  for (var i = 0; i < scoreMapSize; i++) {
    var id = reader.readInt();
    var score = reader.readInt();
    scoreMap.push([id, score]);
  }
  return scoreMap;
};
