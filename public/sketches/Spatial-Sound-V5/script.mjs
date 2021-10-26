
import { bodyPartNames, bodyPartsList, Bodies, detectBodies } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawBodyParts } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'
import { scale, clamp } from '../../util.js';

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

  continuosly(() => drawImageWithOverlay(canvas, video, () => spatialSound(canvas, latestBody)));
}

function spatialSound(canvas, body) {
  if (body) {
    //Detect limb position in world in relation to nose
    detectPosition(body);
  }
}

function detectPosition(body) {
  //Right Upper Body
  let rShoulderDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightShoulder);
  let rShoulderVol = clamp(scale(rShoulderDist, 0.3, 0.14, -40, -6), -40, -6);

  let rElbowDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightElbow);
  let rElbowVol = clamp(scale(rElbowDist, 0.5, 0.12, -40, -6), -40, -6);

  let rWristDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightWrist);
  let rWristVol = clamp(scale(rWristDist, 0.7, 0.2, -40, -6), -40, -6);

  //Right Lower Body
  let rHipDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightHip);
  let rHipVol = clamp(scale(rHipDist, 0.71, 0.4, -40, -6), -40, -6);
  
  let rKneeDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightKnee);
  let rKneeVol = clamp(scale(rKneeDist, 1.1, 0.2, -40, -6), -40, -6);

  let rFootDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightAnkle);
  let rFootVol = clamp(scale(rFootDist, 1.5, 0.6, -40, -6), -40, -6);

  //Left Upper Body
  let lShoulderDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftShoulder);
  let lShoulderVol = clamp(scale(lShoulderDist, 0.3, 0.14, -40, -6), -40, -6);

  let lElbowDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftElbow);
  let lElbowVol = clamp(scale(lElbowDist, 0.5, 0.12, -40, -6), -40, -6);

  let lWristDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftWrist);
  let lWristVol = clamp(scale(lWristDist, 0.7, 0.2, -40, -6), -40, -6);

  //Left Lower Body
  let lHipDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftHip);
  let lHipVol = clamp(scale(lHipDist, 0.71, 0.4, -40, -6), -40, -6);
  
  let lKneeDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftKnee);
  let lKneeVol = clamp(scale(lKneeDist, 1.1, 0.2, -40, -6), -40, -6);

  let lFootDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftAnkle);
  let lFootVol = clamp(scale(lFootDist, 1.5, 0.6, -40, -6), -40, -6);

  //Set oscillators
  oscRFoot.volume.value = rFootVol;
  oscRKnee.volume.value = rKneeVol;
  oscRHip.volume.value = rHipVol;
  oscRWrist.volume.value = rWristVol;
  oscRElbow.volume.value = rElbowVol;
  oscRShoulder.volume.value = rShoulderVol;

  oscLFoot.volume.value = lFootVol;
  oscLKnee.volume.value = lKneeVol;
  oscLHip.volume.value = lHipVol;
  oscLWrist.volume.value = lWristVol;
  oscLElbow.volume.value = lElbowVol;
  oscLShoulder.volume.value = lShoulderVol;
}


const reverb = new Tone.Reverb().toDestination(1.5);

const panRight = new Tone.Panner(0.9).connect(reverb);
const panLeft = new Tone.Panner(-0.9).connect(reverb);

const oscRShoulder = new Tone.Oscillator("A3", "sine").connect(panRight);
const oscRElbow = new Tone.Oscillator("E4", "sine").connect(panRight);
const oscRWrist = new Tone.Oscillator("C5", "sine").connect(panRight);
const oscRHip= new Tone.Oscillator("G#3", "sine").connect(panRight);
const oscRKnee = new Tone.Oscillator("B2", "sine").connect(panRight);
const oscRFoot = new Tone.Oscillator("E2", "sine").connect(panRight);

const oscLShoulder = new Tone.Oscillator("D3", "sine").connect(panLeft);
const oscLElbow = new Tone.Oscillator("A3", "sine").connect(panLeft);
const oscLWrist = new Tone.Oscillator("F4", "sine").connect(panLeft);
const oscLHip = new Tone.Oscillator("G#3", "sine").connect(panLeft);
const oscLKnee = new Tone.Oscillator("B2", "sine").connect(panLeft);
const oscLFoot = new Tone.Oscillator("E2", "sine").connect(panLeft);


//Buttons to start and stop oscillators
document.getElementById("startbtn").onclick = () => {
  Tone.start();
  Tone.Transport.start();
  Tone.Transport.scheduleRepeat((time) => {
    oscRFoot.start(time);
    oscRKnee.start(time);
    oscRHip.start(time);
    oscRWrist.start(time)
    oscRElbow.start(time)
    oscRShoulder.start(time)

    oscLFoot.start(time);
    oscLKnee.start(time);
    oscLHip.start(time);
    oscLWrist.start(time)
    oscLElbow.start(time)
    oscLShoulder.start(time)
  }, "8n");
};

document.getElementById("stopbtn").onclick = () => {
  Tone.Transport.stop();
  oscRFoot.stop();
  oscRKnee.stop();
  oscRHip.stop();
  oscRWrist.stop();
  oscRElbow.stop();
  oscRShoulder.stop();

  oscLFoot.stop();
  oscLKnee.stop();
  oscLHip.stop();
  oscLWrist.stop();
  oscLElbow.stop();
  oscLShoulder.stop();
};

export { run }