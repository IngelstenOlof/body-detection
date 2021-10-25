
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
  if(body) {
    //Detect limb position in world in relation to nose
    detectPosition(body);
  }
}

function detectPosition(body) {
  //Body part declaration
  const nose = body.getBodyPart3D(bodyPartsList.nose);

  const rightShoulder = body.getBodyPart3D(bodyPartsList.rightShoulder)
  const leftShoulder = body.getBodyPart3D(bodyPartsList.leftShoulder)
  const leftFoot = body.getBodyPart3D(bodyPartsList.leftFoot)
  const rightFoot = body.getBodyPart3D(bodyPartsList.rightFoot)

  //Distance declarations
  let noseRShoulderDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightShoulder);
  let noseLShoulderDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftShoulder);
  let noseRFootDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.rightAnkle);
  let noseLFootDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.nose, bodyPartsList.leftAnkle);

  //Volume by distance
  let rShoulderVol = clamp(scale(noseRShoulderDist, 0.3, 0.14, -40, -6), -40, -6);
  let lShoulderVol = clamp(scale(noseLShoulderDist, 0.3, 0.14, -40, -6), -40, -6);
  let rFootVol = clamp(scale(noseRFootDist, 1.5, 0.7, -40, -6), -40, -6);
  let lFootVol = clamp(scale(noseLFootDist, 1.5, 0.7, -40, -6), -40, -6);

  //Set oscillators
  oscRShoulder.volume.value = rShoulderVol;
  oscLShoulder.volume.value = lShoulderVol;
  oscRFoot.volume.value = rFootVol;
  oscLFoot.volume.value = lFootVol;

}

const panRShoulder = new Tone.Panner(1).toDestination();
const oscRShoulder = new Tone.Oscillator("A2", "sine").connect(panRShoulder);

const panLShoulder = new Tone.Panner(-1).toDestination();
const oscLShoulder = new Tone.Oscillator("C#3", "sine").connect(panLShoulder);

const panRFoot = new Tone.Panner(1).toDestination();
const oscRFoot = new Tone.Oscillator("E3", "sine").connect(panRFoot);

const panLFoot = new Tone.Panner(-1).toDestination();
const oscLFoot = new Tone.Oscillator("G#3", "sine").connect(panLFoot);

document.getElementById("startbtn").onclick = () => {
  Tone.start();
  Tone.Transport.start();
  Tone.Transport.scheduleRepeat((time) => {
    oscRFoot.start(time);
    oscLFoot.start(time)
    oscRShoulder.start(time)
    oscLShoulder.start(time)
 }, "8n");
};

document.getElementById("stopbtn").onclick = () => {
  Tone.Transport.stop();
    oscRFoot.stop();
    oscLFoot.stop();
    oscRShoulder.stop();
    oscLShoulder.stop();
};

export { run }