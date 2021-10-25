
import { bodyPartNames, bodyPartsList, Bodies } from '../../lib/bodydetection.mjs'
import { detectBodies } from '../../lib/bodydetection.mjs'
import { drawImageWithOverlay, drawBodyParts } from '../../lib/drawing.mjs'
import { continuosly } from '../../lib/system.mjs'
import { createCameraFeed, facingMode } from '../../lib/camera.mjs'

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

  continuosly(() => drawImageWithOverlay(canvas, video, () => calculateTrig(canvas, latestBody)));
}

function calculateTrig(canvas, body) {
  if (body) {
    let shoulderElbowDistance = body.getDistanceBetweenBodyParts2D(bodyPartsList.rightShoulder, bodyPartsList.rightElbow);
    let shoulderHipDistance = body.getDistanceBetweenBodyParts2D(bodyPartsList.rightShoulder, bodyPartsList.rightHip);
    let hipElbowDistance = body.getDistanceBetweenBodyParts2D(bodyPartsList.rightHip, bodyPartsList.rightElbow);
    

    let angleRadians = Math.acos(shoulderElbowDistance/hipElbowDistance);
    let angleDegrees = (angleRadians * 180) / Math.PI;
    console.log(angleDegrees);


    if(angleDegrees < 20 || angleDegrees === NaN) {
      const synth = new Tone.Synth().toDestination();

      synth.triggerAttackRelease("C2", "8n");
    }
  }
}

export { run }