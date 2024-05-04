const {BaseNode} = require('./BaseNode');
const Amaz = effect.Amaz;

class CGWorldToScreen extends BaseNode {
  constructor() {
    super();
    this.screenHeight = Amaz.AmazingManager.getSingleton('BuiltinObject').getInputTextureHeight();
  }

  getOutput() {
    if (this.inputs[0] == null || this.inputs[1] == null) {
      return new Amaz.Vector2f(0, 0);
    }
    const camera = this.inputs[1]();
    const worldPos = this.inputs[0]();
    if(!camera || !worldPos){
      return new Amaz.Vector2f(0, 0);
    }
    const screenPos = camera.worldToViewportPoint(worldPos);
    return new Amaz.Vector2f(screenPos.x, screenPos.y);
  }
}

exports.CGWorldToScreen = CGWorldToScreen;
