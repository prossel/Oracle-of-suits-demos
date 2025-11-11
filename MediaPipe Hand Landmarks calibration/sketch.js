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
