import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let videoElement;
let gestureRecognizer;
let detections = null;
let selfieMode = true;
let showVideo = true;
let isProcessing = false;

// expose p5 functions to global scope
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;

async function setup() {
  createCanvas(640, 480).parent('canvas-container');

  // hidden video capture used by MediaPipe
  videoElement = createCapture(VIDEO, { flipped: selfieMode });
  videoElement.size(640, 480);
  videoElement.hide();

  // Initialize MediaPipe Gesture Recognizer
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "gesture_recognizer.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  // Start processing video frames
  processVideo();
}

function keyPressed() {
  if (key === 'v' || key === 'V') {
    showVideo = !showVideo;
  }
}

function draw() {
  background(0);

  if (showVideo && videoElement && videoElement.loadedmetadata) {
    image(videoElement, 0, 0, width, height);
  } else {
    // faded background when video is off
    fill(30);
    rect(0, 0, width, height);
  }

  // draw landmarks and gesture labels
  if (detections && detections.landmarks) {
    strokeWeight(2);
    for (let i = 0; i < detections.landmarks.length; i++) {
      const landmarks = detections.landmarks[i];
      drawConnections(landmarks);
      drawLandmarks(landmarks);
      
      // Get recognized gesture for this hand
      let gesture = "None";
      if (detections.gestures && detections.gestures[i] && detections.gestures[i].length > 0) {
        const topGesture = detections.gestures[i][0];
        gesture = `${topGesture.categoryName} (${(topGesture.score * 100).toFixed(0)}%)`;
      }
      drawGestureLabel(gesture, landmarks);
    }
  }
}

async function processVideo() {
  if (!gestureRecognizer || !videoElement || videoElement.elt.readyState !== 4) {
    requestAnimationFrame(processVideo);
    return;
  }

  // Ensure video has valid dimensions
  if (videoElement.elt.videoWidth === 0 || videoElement.elt.videoHeight === 0) {
    requestAnimationFrame(processVideo);
    return;
  }

  if (!isProcessing) {
    isProcessing = true;
    const nowInMs = Date.now();
    detections = gestureRecognizer.recognizeForVideo(videoElement.elt, nowInMs);
    isProcessing = false;
  }

  requestAnimationFrame(processVideo);
}

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20]
];

function drawConnections(landmarks) {
  stroke(0, 255, 0);
  for (const pair of HAND_CONNECTIONS) {
    const a = landmarks[pair[0]];
    const b = landmarks[pair[1]];
    if (!a || !b) continue;
    const ax = selfieMode ? (1 - a.x) * width : a.x * width;
    const ay = a.y * height;
    const bx = selfieMode ? (1 - b.x) * width : b.x * width;
    const by = b.y * height;
    line(ax, ay, bx, by);
  }
}

function drawLandmarks(landmarks) {
  noStroke();
  fill(255, 0, 0);
  for (const lm of landmarks) {
    const x = selfieMode ? (1 - lm.x) * width : lm.x * width;
    const y = lm.y * height;
    circle(x, y, 6);
  }
}

function drawGestureLabel(label, landmarks) {
  // position label near top of the hand bounding area
  let minY = Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const lm of landmarks) {
    const x = selfieMode ? (1 - lm.x) * width : lm.x * width;
    const y = lm.y * height;
    if (y < minY) minY = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }

  const x = constrain((minX + maxX) / 2, 10, width - 10);
  const y = max(16, minY - 10);

  push();
  textAlign(CENTER, BOTTOM);
  textSize(20);
  stroke(0, 200);
  strokeWeight(6);
  fill(255);
  text(label, x, y);
  pop();
}
