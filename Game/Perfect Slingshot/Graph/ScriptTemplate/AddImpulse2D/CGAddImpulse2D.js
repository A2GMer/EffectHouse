/**
 * @file CGAddImpulse2D.js
 * @author Yehua Lyu
 * @date 2024/1/30
 * @brief CGAddImpulse2D.js
 * @copyright Copyright (c) 2023, ByteDance Inc, All Rights Reserved
 */

let Physics2DEnv = null;
const { BaseNode } = require('./BaseNode');
try {
  ({ Physics2DEnv } = require('./Physics2DEnv'));
} catch (error) {
  console.error('Module Physics 2D not found: ', error.message);
}

class CGAddImpulse2D extends BaseNode {
  constructor() {
    super();
    this.impulse = new effect.Amaz.Vector2f(0, 0);
    this.torque = 0;
    this.state = 0;
    this.rigidbody = null;
  }

  execute(index) {
    if (!Physics2DEnv) {
      return;
    }
    if (this.state === 2) {
      this.removeForce();
    }
    let rbObject = this.inputs[1]();
    if (rbObject && rbObject.isInstanceOf('JSScriptComponent') && rbObject.path === 'js/RigidBody2D.js' && this.state === 0) {
      this.impulse = this.inputs[2]();
      let impulse3D = new effect.Amaz.Vector3f(this.impulse.x, this.impulse.y, 0);
      let location = this.inputs[3]();
      let location3D = new effect.Amaz.Vector3f(location.x, location.y, 0);
      this.isLocalPosition = this.inputs[4]();

      this.rigidBody = rbObject.getScript().ref;
      let bodyId = this.rigidBody.bodyId;
      if (bodyId < 0) return;
      let trans = rbObject.entity.getComponent("Transform");
      if (this.isLocalPosition && trans) {
        impulse3D = trans.getWorldOrientation().rotateVectorByQuat(impulse3D);
        this.impulse = new effect.Amaz.Vector2f(impulse3D.x, impulse3D.y);
        location3D = trans.getWorldOrientation().rotateVectorByQuat(location3D).add(trans.getWorldPosition());
        location = new effect.Amaz.Vector2f(location3D.x, location3D.y);
      }
      let bodyPosition = Physics2DEnv.simulator2D.getRigidBodyPosition(bodyId);
      let rVector = effect.Amaz.Vector2f.sub(location, bodyPosition);
      this.torque = rVector.x * this.impulse.y - rVector.y * this.impulse.x;
      this.rigidBody.addForce(this.impulse);
      this.rigidBody.addTorque(this.torque);

      this.state = 1;
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
        this.removeForce();
        break;

      default:
        break;
    }
  }

  removeForce() {
    if (this.rigidBody) {
      this.rigidBody.removeForce(this.impulse);
      this.rigidBody.removeTorque(this.torque);
    }
    this.state = 0;
  }

  getOutput(index) {
    switch (index) {
      case 0:
        return null;
      case 1:
        return this.impulse;
      default:
        return null;
    }

  }

  resetOnRecord(sys) {
    this.impulse = new effect.Amaz.Vector2f(0, 0);
    this.torque = 0;
    this.state = 0;
    this.rigidbody = null;
  }
}

exports.CGAddImpulse2D = CGAddImpulse2D;
