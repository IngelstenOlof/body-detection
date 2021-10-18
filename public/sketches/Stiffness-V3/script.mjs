import {
  bodyPartNames,
  bodyPartsList,
  Bodies,
  detectBodies,
} from "../../lib/bodydetection.mjs";
import { drawImageWithOverlay, drawBodyParts } from "../../lib/drawing.mjs";
import { continuosly } from "../../lib/system.mjs";
import { createCameraFeed, facingMode } from "../../lib/camera.mjs";
import { scale, clamp } from "../../util.js";

async function run(canvas, status) {
  let latestBody;

  const video = await createCameraFeed(
    canvas.width,
    canvas.height,
    facingMode.user
  );
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
    let rightArmDist = body.getDistanceBetweenBodyParts3D(
      bodyPartsList.rightShoulder,
      bodyPartsList.rightWrist
    );
    let rightLegDist = body.getDistanceBetweenBodyParts3D(
      bodyPartsList.rightHip,
      bodyPartsList.rightAnkle
    );

    let leftArmDist = body.getDistanceBetweenBodyParts3D(
      bodyPartsList.leftShoulder,
      bodyPartsList.leftWrist
    );
    let leftLegDist = body.getDistanceBetweenBodyParts3D(
      bodyPartsList.leftHip,
      bodyPartsList.leftAnkle
    );
    
    rightArmDist = Math.floor(clamp(scale(rightArmDist, 0.3, 0.45, 0, 100), 0, 100));
    leftArmDist = Math.floor(clamp(scale(leftArmDist, 0.3, 0.45, 0, 100), 0, 100));
    rightLegDist = Math.floor(clamp(scale(rightLegDist, 0.4, 0.70, 0, 100), 0, 100));
    leftLegDist = Math.floor(clamp(scale(leftLegDist, 0.4, 0.7, 0, 100), 0, 100));
    
    let averageStiffness = (rightArmDist + leftArmDist + leftLegDist + rightLegDist) / 4;
    
    console.log(`Right arm: ${rightArmDist}, Right leg: ${rightLegDist}`);
    Tone.Transport.bpm.value = clamp(scale(averageStiffness, 0, 100, 60, 180), 60, 180);
    //console.log(averageStiffness + "%");
  }
}

const osc = new Tone.Oscillator().toDestination();

  document.getElementById("startbtn").onclick = () => {
    Tone.start();
    Tone.Transport.start();
    Tone.Transport.scheduleRepeat((time) => {
      osc.start(time).stop(time + 0.1);
    }, "8n");
  }


  document.getElementById("stopbtn").onclick = () => {
    Tone.Transport.stop();
  }

export { run }
