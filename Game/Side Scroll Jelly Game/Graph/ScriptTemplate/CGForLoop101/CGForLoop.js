/**
 * @file CGForLoop.js
 * @author liujiacheng
 * @date 2021/8/23
 * @brief CGForLoop.js
 * @copyright Copyright (c) 2021, ByteDance Inc, All Rights Reserved
 */

const {BaseNode} = require('./BaseNode');
const Amaz = effect.Amaz;
const {clamp} = require('./GraphHelper');

class CGForLoop extends BaseNode {
  constructor() {
    super();
  }

  execute(index) {
    let startVal = this.inputs[1]();
    let lastVal = this.inputs[2]();
    let stepVal = this.inputs[3]();
    if ((lastVal - startVal) * stepVal <= 0) {
      return;
    }
    this.currentIndex = startVal;

    // Add bound for safegarding timeout
    startVal = clamp(startVal, -100000,100000);
    lastVal = clamp(lastVal, -100000,100000);

    while ((stepVal > 0 && this.currentIndex < lastVal) || (stepVal < 0 && this.currentIndex > lastVal)) {
      if (this.nexts[1]) {
        this.nexts[1]();
      }
      this.currentIndex = this.currentIndex + stepVal;
    }
    if (this.nexts[0]) {
      this.nexts[0]();
    }
  }

  getOutput(index) {
    return this.currentIndex;
  }

  resetOnRecord(sys){
    this.currentIndex = 0;
  }
}

exports.CGForLoop = CGForLoop;
