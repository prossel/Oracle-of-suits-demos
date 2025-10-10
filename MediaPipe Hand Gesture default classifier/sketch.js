let videoElement;
let hands;
let detections = null;
let cam;
let selfieMode = true;
let showVideo = true;

function setup() {
  createCanvas(640, 480).parent('canvas-container');

  // hidden video capture used by MediaPipe Camera util
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
    selfieMode: selfieMode,
  });

  hands.onResults(onHandsResults);

  // feed frames from the p5 video element to MediaPipe
  cam = new Camera(videoElement.elt, {
    onFrame: async () => {
      await hands.send({ image: videoElement.elt });
    },
    width: 640,
    height: 480
  });

  cam.start();
}

function keyPressed() {
  if (key === 'v' || key === 'V') {
    showVideo = !showVideo;
  }
}

function onHandsResults(results) {
  detections = results;
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
  if (detections && detections.multiHandLandmarks) {
    strokeWeight(2);
    for (let i = 0; i < detections.multiHandLandmarks.length; i++) {
      const landmarks = detections.multiHandLandmarks[i];
      drawConnections(landmarks);
      drawLandmarks(landmarks);
      // classify gesture and draw label
      const gesture = classifyGesture(landmarks);
      drawGestureLabel(gesture, landmarks);
    }
  }
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

// Simple heuristic gesture classifier
// Returns a string name for the most-likely gesture.
function classifyGesture(landmarks) {
  // landmarks indices: tips are 4 (thumb), 8 (index), 12 (middle), 16 (ring), 20 (pinky)
  const wrist = landmarks[0];
  const tips = [4, 8, 12, 16, 20].map(i => landmarks[i]);

  // helper: euclidean distance between two landmarks (normalized)
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // compute tip-to-wrist distances
  const dists = tips.map(t => dist(t, wrist));

  // normalized by hand size approximation: use distance between wrist and middle_finger_mcp (9)
  const handSize = dist(wrist, landmarks[9]) || 0.0001;
  const norm = dists.map(d => d / handSize);

  // thresholds tuned empirically: larger normalized distance => extended finger
  const EXTENDED = 0.9; // > roughly 0.9 considered extended
  const FOLDED = 0.6;   // < roughly 0.6 considered folded

  const extended = norm.map(n => n > EXTENDED);

  // Count extended fingers (exclude thumb for some gestures if needed)
  const countExtended = extended.reduce((s, v) => s + (v ? 1 : 0), 0);

  // Fist: few or no extended fingers
  if (countExtended <= 1) return 'Fist';

  // Open palm: most fingers extended
  if (countExtended >= 4) return 'Open Palm';

  // Pointing: only index extended
  if (extended[1] && !extended[2] && !extended[3] && !extended[4]) return 'Pointing';

  // Thumbs up: thumb extended while other fingers folded and thumb is above wrist vertically
  const thumbUp = extended[0] && !extended[1] && !extended[2] && !extended[3] && !extended[4];
  if (thumbUp) {
    // compare y coordinates (remember: y grows downward in pixel space)
    if (tips[0].y < wrist.y) return 'Thumbs Up';
    else return 'Thumbs Out';
  }

  // fallback: return number of extended fingers
  return `${countExtended} fingers`;
}

function drawGestureLabel(label, landmarks) {
  // position label near top of the hand bounding area
  let minY = Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const lm of landmarks) {
    const x = lm.x * width;
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
