import { ObjectDetector, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";

let videoElement;
let objectDetector;
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

  // Initialize MediaPipe Object Detector
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  objectDetector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    scoreThreshold: 0.5,
    maxResults: 5
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

  // draw detected objects with bounding boxes and labels
  if (detections && detections.detections) {
    strokeWeight(2);
    textSize(16);
    textAlign(LEFT, TOP);
    
    for (const detection of detections.detections) {
      const bbox = detection.boundingBox;
      const category = detection.categories[0];
      
      // Calculate bounding box coordinates
      let x = bbox.originX;
      let y = bbox.originY;
      let w = bbox.width;
      let h = bbox.height;
      
      // Flip horizontally if in selfie mode
      if (selfieMode) {
        x = width - x - w;
      }
      
      // Draw bounding box
      stroke(0, 255, 0);
      strokeWeight(3);
      noFill();
      rect(x, y, w, h);
      
      // Draw label with background
      const label = `${category.categoryName} (${(category.score * 100).toFixed(0)}%)`;
      const textW = textWidth(label);
      const padding = 4;
      
      fill(0, 255, 0);
      noStroke();
      rect(x, y - 24, textW + padding * 2, 24);
      
      fill(0);
      text(label, x + padding, y - 20);
    }
  }
}

async function processVideo() {
  if (!objectDetector || !videoElement || videoElement.elt.readyState !== 4) {
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
    detections = objectDetector.detectForVideo(videoElement.elt, nowInMs);
    isProcessing = false;
  }

  requestAnimationFrame(processVideo);
}
