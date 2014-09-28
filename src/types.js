goog.provide ('Types');

Types.constructors_ = {};


Types.registerType = function(constructor, value) {
  constructor.type = value;
  Types.constructors_[value] = constructor;
};


Types.getConstructor = function(id) {
  return Types.constructors_[id];
};
