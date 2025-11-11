# MediaPipe Hand Landmarks — Active Area Calibration (p5.js)

This folder sets up a calibration example for defining an on-canvas "active area" using MediaPipe Hands and p5.js. It starts from the basic hand-landmarks overlay and will add a short calibration flow to record and visualize the usable region on screen.

Key points

- Built with p5.js (global mode) and MediaPipe Hands (via CDN).
- Purpose: demonstrate how to calibrate an interactive "active area" (e.g., a rectangular region) based on live hand landmarks.
- Current state: identical to the starter overlay — it captures the webcam and draws landmarks and connections. The calibration UI/logic will be added next.

Files

- `index.html` — HTML entry. Loads p5, p5.sound (optional), MediaPipe scripts, and `sketch.js`. Includes a short summary below the canvas describing the calibration goal.
- `sketch.js` — The p5 sketch and MediaPipe integration (setup, draw, and results handling). For now it renders live landmarks; calibration code will be layered on top in a later step.
- `style.css` — Minimal styling for canvas and the summary text.
- `libraries/` — Third-party libraries: `p5.min.js`, `p5.sound.min.js`.

How it works (current)

1. `sketch.js` creates a hidden p5 video capture (flipped for selfie mode).
2. MediaPipe Hands is configured and provided frames with the MediaPipe Camera util.
3. When MediaPipe returns landmark results, the sketch stores them and draws landmarks and connections on top of the video every frame.

Calibration concept (coming next)

- Map normalized landmark coordinates to canvas pixels consistently (already in place).
- Guide the user through a brief flow (e.g., place hand at corners or move around edges) to capture bounds.
- Compute and store the active area (min/max X/Y or a polygon); visualize it on the canvas.
- Use the calibrated region to gate interactions or scale gestures in downstream sketches.

Usage

1. Open `index.html` in a browser (preferably via a local server or `https`).
2. Allow camera access when prompted.
3. You should see the live camera feed with green lines (connections) and red dots (landmarks) overlaying detected hands.

Notes and troubleshooting

- Browsers restrict camera access to secure contexts. If you open the file directly (file://), camera access may be blocked — use `http://localhost` or host it.
- If you see `createCanvas is not defined` or similar, make sure `libraries/p5.min.js` is loaded before `sketch.js` in `index.html` (this repo already does).
- Audio features (p5.sound) are included but not required by the sketch.

License
This example is provided as-is for learning and prototyping.
