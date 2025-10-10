import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let videoElement;
let gestureRecognizer;
let detections = null;
let selfieMode = true;
let showVideo = true;
let isProcessing = false;

// p5 instance mode to avoid cross-origin issues with ES modules
new p5((p) => {
  p.setup = async function() {
    p.createCanvas(640, 480).parent('canvas-container');

    // hidden video capture used by MediaPipe
    videoElement = p.createCapture(p.VIDEO, { flipped: selfieMode });
    videoElement.size(640, 480);
    videoElement.hide();

    // Initialize MediaPipe Gesture Recognizer
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
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
  };

  p.keyPressed = function() {
    if (p.key === 'v' || p.key === 'V') {
      showVideo = !showVideo;
    }
  };

  p.draw = function() {
    p.background(0);

    if (showVideo && videoElement && videoElement.loadedmetadata) {
      p.image(videoElement, 0, 0, p.width, p.height);
    } else {
      // faded background when video is off
      p.fill(30);
      p.rect(0, 0, p.width, p.height);
    }

    // draw landmarks and gesture labels
    if (detections && detections.landmarks) {
      p.strokeWeight(2);
      for (let i = 0; i < detections.landmarks.length; i++) {
        const landmarks = detections.landmarks[i];
        drawConnections(p, landmarks);
        drawLandmarks(p, landmarks);
        
        // Get recognized gesture for this hand
        let gesture = "None";
        if (detections.gestures && detections.gestures[i] && detections.gestures[i].length > 0) {
          const topGesture = detections.gestures[i][0];
          gesture = `${topGesture.categoryName} (${(topGesture.score * 100).toFixed(0)}%)`;
        }
        drawGestureLabel(p, gesture, landmarks);
      }
    }
  };

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
});

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20]
];

function drawConnections(p, landmarks) {
  p.stroke(0, 255, 0);
  for (const pair of HAND_CONNECTIONS) {
    const a = landmarks[pair[0]];
    const b = landmarks[pair[1]];
    if (!a || !b) continue;
    const ax = selfieMode ? (1 - a.x) * p.width : a.x * p.width;
    const ay = a.y * p.height;
    const bx = selfieMode ? (1 - b.x) * p.width : b.x * p.width;
    const by = b.y * p.height;
    p.line(ax, ay, bx, by);
  }
}

function drawLandmarks(p, landmarks) {
  p.noStroke();
  p.fill(255, 0, 0);
  for (const lm of landmarks) {
    const x = selfieMode ? (1 - lm.x) * p.width : lm.x * p.width;
    const y = lm.y * p.height;
    p.circle(x, y, 6);
  }
}

function drawGestureLabel(p, label, landmarks) {
  // position label near top of the hand bounding area
  let minY = Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const lm of landmarks) {
    const x = selfieMode ? (1 - lm.x) * p.width : lm.x * p.width;
    const y = lm.y * p.height;
    if (y < minY) minY = y;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }

  const x = p.constrain((minX + maxX) / 2, 10, p.width - 10);
  const y = p.max(16, minY - 10);

  p.push();
  p.textAlign(p.CENTER, p.BOTTOM);
  p.textSize(20);
  p.stroke(0, 200);
  p.strokeWeight(6);
  p.fill(255);
  p.text(label, x, y);
  p.pop();
}
