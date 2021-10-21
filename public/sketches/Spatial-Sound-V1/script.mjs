
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
    //Detect limb position in world in relation to head
    detectPosition(body);
    //Produce sound in relation to position

  }
}

function detectPosition(body) {
  let rightWrist = body.getBodyPart3D(bodyPartsList.rightWrist);
  let noseWristDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.rightWrist, bodyPartsList.nose);
  
  let wristVol = clamp(scale(noseWristDist, 0.6, 0.1, -40, -6), -40, -6);
  let wristPan = clamp(scale(rightWrist.position.x, -0.62, 0.35, 1, -1), -1, 1);

  osc.volume.value = wristVol;
  pan.pan.value = wristPan;

  console.log(noseWristDist);
}

const pan = new Tone.Panner(-1).toDestination();
const osc = new Tone.Oscillator(440, "sine").connect(pan); // 440 = A

document.getElementById("startbtn").onclick = () => {
  Tone.start();
  Tone.Transport.start();
  Tone.Transport.scheduleRepeat((time) => {
    osc.start(time);
  }, "8n");
};

document.getElementById("stopbtn").onclick = () => {
  Tone.Transport.stop();
  osc.stop();
};

export { run }