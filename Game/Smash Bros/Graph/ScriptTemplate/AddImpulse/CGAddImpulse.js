/**
 * @file CGAddImpulse.js
 * @author Jie Li
 * @date 2021/8/23
 * @brief CGAddImpulse.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */
const {BaseNode} = require('./BaseNode');
let GlobalParameters;
try {
  ({ GlobalParameters, GlobalParameters: { pbdSimulator, addModifiedProperty } } = require('./GlobalParameters'));
} catch (error) {
  console.error('Module GlobalParameters not found:', error.message);
}
const Amaz = effect.Amaz;

class CGAddImpulse extends BaseNode {
  constructor() {
    super();
    this.impulse = new effect.Amaz.Vector3f(0, 0, 0);
    this.state = 0;
    this.previousScaledImpulse = new effect.Amaz.Vector3f(0, 0, 0);
  }

  execute(index) {
    let object = this.inputs[1]();

    if (GlobalParameters && object && object.isInstanceOf('JSScriptComponent') && object.path === 'js/RigidBody.js') {
      this.rigidBody = object.getScript().ref;
      if (this.rigidBody.bodyId >= 0) {
        this.impulse = this.inputs[2]();
        let position = this.inputs[3]();
        let isLocal = this.inputs[4]();
        if (this.impulse != null && position != null && isLocal != null) {
          if (isLocal) {
            let trans = object.entity.getComponent("Transform");
            this.impulse = trans.getWorldOrientation().rotateVectorByQuat(this.impulse);
            position = trans.getWorldOrientation().rotateVectorByQuat(position).add(trans.getWorldPosition());
          }
          let scaledImpulse = effect.Amaz.Vector3f.mul(this.impulse, GlobalParameters.gravityFactor);
          if (!GlobalParameters.framerateIndependence) 
            this.rigidBody.totalExternalForce.sub(this.previousScaledImpulse);
          this.rigidBody.totalExternalForce.add(scaledImpulse);
          // stores current impulse, it will be later removed in PBDSystem onLateUpdate
          this.rigidBody.impulse = scaledImpulse;
          let externalForce = this.rigidBody.totalExternalForce.copy();
          let newValue = [externalForce.x, externalForce.y, externalForce.z];
          GlobalParameters.addModifiedPropertyFast(GlobalParameters.RigidBodyExternalForce, this.rigidBody.bodyId, newValue);
            
          let rbCenter = GlobalParameters.pbdSimulator.getRigidBodyPosition(this.rigidBody.bodyId);
          let r = Amaz.Vector3f.sub(position, rbCenter);
          this.torque = r.cross(scaledImpulse);
          this.rigidBody.torqueFromImpulse = this.torque;
          // subtract previous torque
          this.rigidBody.totalExternalTorque.sub(r.cross(this.previousScaledImpulse));
          this.rigidBody.totalExternalTorque.add(this.torque);
          let newValueTorque = [
            this.rigidBody.totalExternalTorque.x,
            this.rigidBody.totalExternalTorque.y,
            this.rigidBody.totalExternalTorque.z];
          GlobalParameters.addModifiedPropertyFast(GlobalParameters.RigidBodyExternalTorque, this.rigidBody.bodyId, newValueTorque);
            
          this.state = 1;
          this.previousScaledImpulse = scaledImpulse;
          GlobalParameters.isAddingImpulse = true;
        }
      }
    }

    if (this.nexts[0]) {
      this.nexts[0]();
    }
  }

  onUpdate(sys, deltatime) { 
    switch (this.state) {
      // idle
      case 0:
        break;
      
      // wait for a frame
      case 1:
        this.state = 2;
      break;
    
      // remove force
      case 2:
        if (!GlobalParameters.framerateIndependence)
        {
          this.rigidBody.totalExternalForce.sub(this.previousScaledImpulse);
          let externalForce = this.rigidBody.totalExternalForce.copy();
          let newValue = [externalForce.x, externalForce.y, externalForce.z];
          GlobalParameters.addModifiedPropertyFast(GlobalParameters.RigidBodyExternalForce, this.rigidBody.bodyId, newValue);
        
          this.rigidBody.totalExternalTorque.sub(this.torque);
          let newValueTorque = [
            this.rigidBody.totalExternalTorque.x,
            this.rigidBody.totalExternalTorque.y,
            this.rigidBody.totalExternalTorque.z];
          GlobalParameters.addModifiedPropertyFast(GlobalParameters.RigidBodyExternalTorque, this.rigidBody.bodyId, newValueTorque);
          this.previousScaledImpulse.set(0, 0, 0);
        }
        this.state = 0;
      break;
    
      default:
        break;
    }
  }

  getOutput(index) {
    switch(index) {
      case 1:
        return this.impulse;
      default:
        return null;
    }

  }

}

exports.CGAddImpulse = CGAddImpulse;
