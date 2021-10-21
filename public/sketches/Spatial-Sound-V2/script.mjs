
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
  }
}

function detectPosition(body) {
  let rightWrist = body.getBodyPart3D(bodyPartsList.rightWrist);
  let nose = body.getBodyPart3D(bodyPartsList.nose);
  
  Tone.Listener.positionX.value = nose.position.z;
  Tone.Listener.positionY.value = nose.position.y;
  Tone.Listener.positionZ.value = nose.position.x;

  pan3D.positionX.value = rightWrist.position.x;
  pan3D.positionY.value = rightWrist.position.y;
  pan3D.positionZ.value = rightWrist.position.z;

}

const options = {
positionX: 0,
positionY: 0,
positionZ: 0,
panningModel: "HRTF",
distanceModel: "exponential",
};
const pan3D = new Tone.Panner3D(options).toDestination();
const osc = new Tone.Oscillator(440, "sine").connect(pan3D); // 440 = A

function setRotation(angle) {
  Tone.Listener.forwardX.value = Math.sin(angle);
  Tone.Listener.forwardY.value = 0;
  Tone.Listener.forwardZ.value = -Math.cos(angle);
}

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