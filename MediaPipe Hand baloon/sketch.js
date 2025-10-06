let videoElement;
let hands;
let detections = null;
let cam;
let selfieMode = true;
let balloon;
let showVideo = true;
let shortcutP;

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

  // create the falling balloon
  balloon = new Balloon(width * 0.5, 40, 36); // x, y, radius

}

function keyPressed() {
  // toggle video display when user presses 'v' or 'V'
  if (key === 'v' || key === 'V') {
    showVideo = !showVideo;
    if (shortcutP) {
      const state = showVideo ? 'ON' : 'OFF';
      shortcutP.html(`Shortcut: press V to toggle video (Video: ${state})`);
    }
  }
}

function onHandsResults(results) {
  // results.multiHandLandmarks is an array of landmark arrays
  detections = results;
}

function draw() {
  background(0);

  // Draw the current video frame to the canvas if enabled
  if (showVideo && videoElement && videoElement.loadedmetadata) {
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

  // update and draw the balloon on top of everything
  if (balloon) {
    balloon.update(detections);
    balloon.draw();
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

// Balloon class: simple physics with gravity, edge bounce, and collisions
// against hand landmarks (treats landmarks as small circles).
class Balloon {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), 0);
    this.r = r;
    this.gravity = 0.05; // gentle fall
    this.restitution = 0.85; // bounce energy retention
  }

  update(detections) {
    // apply gravity
    this.vel.y += this.gravity;
    // integrate
    this.pos.add(this.vel);

    // canvas edge collisions
    // left/right
    if (this.pos.x - this.r < 0) {
      this.pos.x = this.r;
      this.vel.x *= -this.restitution;
    } else if (this.pos.x + this.r > width) {
      this.pos.x = width - this.r;
      this.vel.x *= -this.restitution;
    }
    // top/bottom
    if (this.pos.y - this.r < 0) {
      this.pos.y = this.r;
      this.vel.y *= -this.restitution;
    } else if (this.pos.y + this.r > height) {
      this.pos.y = height - this.r;
      this.vel.y *= -this.restitution;
      // small damping on ground contact to settle
      if (abs(this.vel.y) < 1) this.vel.y = 0;
    }

    // collisions with hand landmarks
    if (detections && detections.multiHandLandmarks) {
      // treat each landmark as a small circle with this radius
      const lmRadius = 8; // collision radius around each landmark
      for (let h = 0; h < detections.multiHandLandmarks.length; h++) {
        const landmarks = detections.multiHandLandmarks[h];
        for (const lm of landmarks) {
          const lmPos = createVector(lm.x * width, lm.y * height);
          const toBall = p5.Vector.sub(this.pos, lmPos);
          const dist = toBall.mag();
          const minDist = this.r + lmRadius;
          if (dist > 0 && dist < minDist) {
            // push balloon out of the landmark
            const normal = toBall.copy().normalize();
            const overlap = minDist - dist;
            this.pos.add(p5.Vector.mult(normal, overlap + 0.1));
            // instead of reflecting, give the balloon a gentle upward lift
            const lift = 2.0; // upward speed applied on touch (tweakable)
            // apply lift when touching; if already moving up, give a small boost
            if (this.vel.y > -lift) {
              this.vel.y = -lift;
            } else {
              this.vel.y -= 0.4; // small extra boost
            }
            // nudge horizontally away from the landmark so the balloon doesn't stick
            this.vel.x += normal.x * 0.6;
            // mild damping so the balloon doesn't accelerate uncontrollably
            this.vel.mult(0.98);
          } else if (dist === 0) {
            // coincident - nudge upward
            this.pos.y -= minDist;
            this.vel.y = -abs(this.vel.y) - 1;
          }
        }
      }
    }
  }

  draw() {
    push();
    noStroke();
    // balloon body
    fill(220, 30, 30);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2);
    // subtle highlight
    fill(255, 120, 120, 160);
    ellipse(this.pos.x - this.r * 0.3, this.pos.y - this.r * 0.4, this.r * 0.5, this.r * 0.5);
    // string
    stroke(120);
    strokeWeight(2);
    line(this.pos.x, this.pos.y + this.r * 0.6, this.pos.x, this.pos.y + this.r * 2.2);
    pop();
  }
}
