'use strict';
const Amaz = effect.Amaz;
const {BaseNode} = require('./BaseNode');
class CGMaterialInfo extends BaseNode {
  constructor() {
    super();
    this.materialPropertySheetNameMap = {
      Texture2D: 'texmap',
      Double: 'floatmap',
      Vector2f: 'vec2map',
      Vector3f: 'vec3map',
      Vector4f: 'vec4map',
      Color: 'vec4map',
      Matrix4x4f: 'mat4map',
    };
    this.materialGetterMap = {
      Texture2D: 'getTex',
      Double: 'getFloat',
      Vector2f: 'getVec2',
      Vector3f: 'getVec3',
      Vector4f: 'getVec4',
      Color: 'getVec4',
      Matrix4x4f: 'getMat4',
    };
  }

  transValueType(value) {
    if (this.valueType === 'Color' && value instanceof Amaz.Vector4f) {
      return new Amaz.Color(value.x, value.y, value.z, value.w);
    } else {
      return value;
    }
  }

  getOutput(index) {
    const materialArray = this.inputs[0]();
    const uniformName = this.inputs[1]();

    if (materialArray === null || materialArray === undefined || uniformName === null || uniformName === undefined) {
      return;
    }

    const material = materialArray[0];
    const propertySheetHasIntUniform = material.properties.intmap.has(uniformName);

    // Handling the int edge case
    if (propertySheetHasIntUniform) {
      return material.getInt(uniformName);
    }

    const propertySheet = material.properties[this.materialPropertySheetNameMap[this.valueType]];

    if (propertySheet && propertySheet.has(uniformName)) {
      return this.transValueType(material[this.materialGetterMap[this.valueType]](uniformName));
    }
    return null;
  }
}
exports.CGMaterialInfo = CGMaterialInfo;
