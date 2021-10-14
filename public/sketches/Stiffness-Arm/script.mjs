
import { bodyPartNames, bodyPartsList, Bodies, detectBodies } from "../../lib/bodydetection.mjs";
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

  continuosly(() => drawImageWithOverlay(canvas, video, () => stiffnessMeasurement(canvas, latestBody)));
}

function stiffnessMeasurement(canvas, body) {
  if(body) {
    let rightArmDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.rightShoulder, bodyPartsList.rightWrist);
    let rightLegDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.rightHip, bodyPartsList.rightAnkle);
    
    let leftArmDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftShoulder, bodyPartsList.leftWrist);
    let leftLegDist = body.getDistanceBetweenBodyParts3D(bodyPartsList.leftHip, bodyPartsList.leftAnkle);
    
    const rightRatio = rightArmDist / rightLegDist;
    const leftRatio = leftArmDist / leftLegDist;

    const averageStiffness = (rightRatio + leftRatio) / 2;
    
    console.log(averageStiffness);
  }
}

export { run }