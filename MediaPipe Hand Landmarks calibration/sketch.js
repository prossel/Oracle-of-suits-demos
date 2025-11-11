/**
 * MediaPipe Hand Landmarks — Active Area Calibration (scaffold)
 *
 * This sketch currently mirrors the basic hand-landmarks overlay:
 * - Captures webcam video (selfie mode)
 * - Runs MediaPipe Hands
 * - Draws landmarks and connections on a p5 canvas
 *
 * Next iteration (not yet implemented here) will add a short calibration flow
 * to record an on-canvas "active area" (e.g., bounds or polygon) derived from
 * the live landmarks, and visualize it for downstream interaction.
 */
let videoElement;
let hands;
let detections = null;
let cam;
let selfieMode = true;

// Active area definition
let activeArea = {
  x: 160,      // top-left x
  y: 120,      // top-left y
  width: 320,  // width of the area
  height: 240  // height of the area
};
const MOVE_STEP = 5;    // pixels to move with arrow keys
const SIZE_STEP = 5;   // pixels to resize with SHIFT + arrows
let calibrationMode = true;  // calibration mode active by default
let positionMode = false;  // position adjustment mode
let sizeMode = false;      // size adjustment mode

function setup() {
  createCanvas(640, 480)
    // Put the canvas inside the #canvas-container div so it appears above the summary
    .parent('canvas-container');

  // create a hidden video element that MediaPipe Camera util will use
  videoElement = createCapture(VIDEO, { flipped: selfieMode });
  videoElement.size(640, 480);
  videoElement.hide();

  // Initialize MediaPipe Hands
  hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5,
    // Tell MediaPipe that we are using a selfie (mirrored) video so output
    // landmark coordinates match the flipped capture.
    selfieMode: selfieMode,
  });

  hands.onResults(onHandsResults);

  // Use MediaPipe Camera util to feed frames from the p5 video element
  // cameraUtils expects a DOM video element; p5's capture has an elt property
  cam = new Camera(videoElement.elt, {
    onFrame: async () => {
      await hands.send({ image: videoElement.elt });
    },
    width: 640,
    height: 480
  });

  cam.start();
}

function onHandsResults(results) {
  // results.multiHandLandmarks is an array of landmark arrays
  detections = results;
}

function draw() {
  background(0);

  // Draw the current video frame to the canvas
  if (videoElement && videoElement.loadedmetadata) {
    // draw the (already flipped) capture directly
    image(videoElement, 0, 0, width, height);
  }

  // draw landmarks on top
  if (detections && detections.multiHandLandmarks) {
    strokeWeight(2);
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      const landmarks = detections.multiHandLandmarks[i];
      // draw connections
      drawConnections(landmarks);
      // draw points
      drawLandmarks(landmarks);
    }
  }

  // Handle calibration mode features
  if (calibrationMode) {
    // Handle continuous keyboard input for active area adjustment
    handleActiveAreaControls();
    
    // Draw active area
    drawActiveArea();
    
    // Display active area coordinates
    displayActiveAreaInfo();
  }
}

const HAND_CONNECTIONS = [
  // wrist to thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // wrist to index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // pinky
  [0, 17], [17, 18], [18, 19], [19, 20]
];

function drawConnections(landmarks) {
  stroke(0, 255, 0);
  for (const pair of HAND_CONNECTIONS) {
    const a = landmarks[pair[0]];
    const b = landmarks[pair[1]];
    if (!a || !b) continue;
    // landmarks are normalized [0..1], (x,y) with origin top-left
    // landmarks are normalized [0..1] and, because we enabled
    // selfieMode and flipped the capture, map x directly.
    const ax = a.x * width;
    const ay = a.y * height;
    const bx = b.x * width;
    const by = b.y * height;
    line(ax, ay, bx, by);
  }
}

function drawLandmarks(landmarks) {
  noStroke();
  fill(255, 0, 0);
  for (const lm of landmarks) {
    const x = lm.x * width;
    const y = lm.y * height;
    circle(x, y, 6);
  }
}

function handleActiveAreaControls() {
  // Determine step size: use STEP if SHIFT is held, otherwise 1 pixel
  const moveStep = keyIsDown(SHIFT) ? MOVE_STEP : 1;
  const sizeStep = keyIsDown(SHIFT) ? SIZE_STEP : 1;
  
  // Handle position mode
  if (positionMode) {
    if (keyIsDown(LEFT_ARROW)) {
      activeArea.x = max(0, activeArea.x - moveStep);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      activeArea.x = min(width - activeArea.width, activeArea.x + moveStep);
    }
    if (keyIsDown(UP_ARROW)) {
      activeArea.y = max(0, activeArea.y - moveStep);
    }
    if (keyIsDown(DOWN_ARROW)) {
      activeArea.y = min(height - activeArea.height, activeArea.y + moveStep);
    }
  }
  
  // Handle size mode
  if (sizeMode) {
    if (keyIsDown(LEFT_ARROW)) {
      activeArea.width = max(50, activeArea.width - sizeStep);
    }
    if (keyIsDown(RIGHT_ARROW)) {
      activeArea.width = min(width - activeArea.x, activeArea.width + sizeStep);
    }
    if (keyIsDown(UP_ARROW)) {
      activeArea.height = max(50, activeArea.height - sizeStep);
    }
    if (keyIsDown(DOWN_ARROW)) {
      activeArea.height = min(height - activeArea.y, activeArea.height + sizeStep);
    }
  }
}

function drawActiveArea() {
  // Draw green rectangle for active area
  push();
  noFill();
  stroke(0, 255, 0);
  strokeWeight(3);
  rect(activeArea.x, activeArea.y, activeArea.width, activeArea.height);
  pop();
}

function displayActiveAreaInfo() {
  // Display coordinates in top-left corner with a semi-transparent background
  push();
  fill(0, 0, 0, 50);
  noStroke();
  rect(10, 10, 320, 130);
  
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`Active Area:`, 20, 20);
  text(`Position: (${activeArea.x}, ${activeArea.y})`, 20, 40);
  text(`Size: ${activeArea.width} x ${activeArea.height}`, 20, 60);
  
  // Show current mode
  let modeText = positionMode ? '[P] Position mode' : (sizeMode ? '[S] Size mode' : 'P: position | S: size');
  text(modeText, 20, 80);
  
  text(`SHIFT: faster adjustments`, 20, 100);
  text(`C: toggle calibration mode`, 20, 120);
  pop();
}

function keyPressed() {
  // Toggle calibration mode with C key
  if (key === 'c' || key === 'C') {
    calibrationMode = !calibrationMode;
    console.log(`Calibration mode: ${calibrationMode ? 'ON' : 'OFF'}`);
  }
  
  // Toggle position mode with P key
  if (key === 'p' || key === 'P') {
    positionMode = !positionMode;
    if (positionMode) {
      sizeMode = false; // Turn off size mode
    }
    console.log(`Position mode: ${positionMode ? 'ON' : 'OFF'}`);
  }
  
  // Toggle size mode with S key
  if (key === 's' || key === 'S') {
    sizeMode = !sizeMode;
    if (sizeMode) {
      positionMode = false; // Turn off position mode
    }
    console.log(`Size mode: ${sizeMode ? 'ON' : 'OFF'}`);
  }
  
  // Prevent default browser behavior for arrow keys when in position or size mode
  if ((positionMode || sizeMode) && 
      (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || 
       keyCode === UP_ARROW || keyCode === DOWN_ARROW)) {
    return false;
  }
}
