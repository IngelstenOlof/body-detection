
import { bodyPartNames, bodyPartsList, Bodies, detectBodies } from "../../lib/bodydetection.mjs";
import { drawImageWithOverlay, drawBodyParts } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
import {scale, clamp} from '../../util.js'


async function run(canvas, status) {
  let latestBody;

  const video = await createCameraFeed(canvas.width, canvas.height, facingMode.user);
  const config = {
    video: video,
    multiPose: false,
    sampleRate: 100,
    flipHorizontal: true,
  };

  detectBodies(config, (e) => (latestBody = e.detail.bodies.listOfBodies[0]));

  continuosly(() => drawImageWithOverlay(canvas, video, () => stiffnessMeasurement(canvas, latestBody)));
}

function stiffnessMeasurement(canvas, body) {
  if (body) {
    let rightArmDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.rightShoulder, bodyPartsList.rightWrist);
    let rightLegDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.rightHip, bodyPartsList.rightAnkle);

    let leftArmDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftShoulder, bodyPartsList.leftWrist);
    let leftLegDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftHip, bodyPartsList.leftAnkle);

    const rightRatio = rightArmDist / rightLegDist;
    const leftRatio = leftArmDist / leftLegDist;
    const averageStiffness = (rightRatio + leftRatio) / 2;

    leftTime = clamp(scale(leftRatio, 0.5, 1.2, 0.05, 0.4), 0.05, 0.4);
    rightTime = clamp(scale(rightRatio, 0.5, 1.2, 0.05, 0.4), 0.05, 0.4);

    
    console.log(averageStiffness);
  }
}

Tone.Transport.bpm.value = 120;
const leftPan = new Tone.Panner(-1).toDestination();
const rightPan = new Tone.Panner(1).toDestination();
const rightOsc = new Tone.Oscillator(440, "sine").connect(rightPan); // 440 = A
const leftOsc = new Tone.Oscillator(554.365, "sine").connect(leftPan); // 554.365 = C#
let leftTime = 0.1;
let rightTime = 0.1;

document.getElementById("startbtn").onclick = () => {
  Tone.start();
  
  Tone.Transport.start();
  Tone.Transport.scheduleRepeat((time) => {
    leftOsc.start(time).stop(time + leftTime);
    rightOsc.start(time).stop(time + rightTime);
  }, "8n");
}

document.getElementById("stopbtn").onclick = () => {
  Tone.Transport.stop();
}

export { run }


/* 
document.getElementById("startbtn").onclick = () => {
  Tone.start();
  Tone.Transport.start();
  Tone.Transport.scheduleRepeat((time) => {
    rightOsc.start(time).stop(time + 0.1);
    leftOsc.start(time).stop(time + 0.1);
  }, "8n");
} */