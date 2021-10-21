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

  continuosly(() => drawImageWithOverlay(canvas, video, () => balance(canvas, latestBody)));
}

function balance(canvas, body) {
  if(body) {
    let leftFootPos = body.getBodyPart2D(bodyPartsList.leftAnkle).position;
    let rightHipPos = body.getBodyPart2D(bodyPartsList.rightHip).position;
    
    let distanceFeet = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftAnkle, bodyPartsList.rightAnkle);
    distanceFeet = clamp(scale(distanceFeet, 0.24, 1.04, -40, -6), -40, -6);
    console.log(distanceFeet);

    osc.volume.value = distanceFeet;


    if(leftFootPos.y > rightHipPos.y - 20 && leftFootPos.y < rightHipPos.y + 20) {
      console.log("HIP TIME!")
    }
  }
}

const vibrato = new Tone.Vibrato(880, 0).toDestination();
const osc = new Tone.Oscillator(440, "sine");
osc.connect(vibrato);

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