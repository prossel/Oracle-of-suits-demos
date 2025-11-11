# MediaPipe Hand Landmarks — Active Area Calibration (p5.js)

This folder demonstrates how to define and calibrate an on-canvas "active area" using MediaPipe Hands and p5.js. The active area is a rectangular region that can be adjusted in real-time and used to map hand landmarks to a specific interaction zone.

Key points

- Built with p5.js (global mode) and MediaPipe Hands (via CDN).
- Purpose: demonstrate how to calibrate an interactive "active area" (rectangular region) and map hand landmarks to it.
- Features: real-time adjustable active area with keyboard controls, persistent storage (localStorage), and live coordinate mapping of the index fingertip.

Files

- `index.html` — HTML entry. Loads p5, p5.sound (optional), MediaPipe scripts, and `sketch.js`. Includes a summary below the canvas describing the calibration features.
- `sketch.js` — The p5 sketch with MediaPipe integration, active area calibration controls, coordinate mapping, and localStorage persistence.
- `style.css` — Minimal styling for canvas and the summary text.
- `libraries/` — Third-party libraries: `p5.min.js`, `p5.sound.min.js` (in parent folder).

How it works

1. `sketch.js` creates a hidden p5 video capture (flipped for selfie mode).
2. MediaPipe Hands is configured and provided frames with the MediaPipe Camera util.
3. When MediaPipe returns landmark results, the sketch stores them and draws landmarks and connections on top of the video every frame.
4. A cyan rectangle shows the active area on the canvas.
5. The index fingertip (landmark 8) displays two sets of coordinates with a semi-transparent background:
   - Canvas coordinates (yellow text)
   - Mapped coordinates relative to the active area (cyan text)

Calibration controls

- **C key**: Toggle calibration mode on/off (hides/shows the active area and controls)
- **P key**: Enter position mode (move the active area with arrow keys)
- **S key**: Enter size mode (resize the active area with arrow keys)
- **Arrow keys**: Adjust position or size (depending on mode)
- **SHIFT + arrows**: Make faster adjustments (5 pixels instead of 1)
- The active area is automatically saved to localStorage after adjustments

The calibrated region can be used to gate interactions or scale gestures in downstream sketches.

Usage

1. Open `index.html` in a browser (preferably via a local server or `https`).
2. Allow camera access when prompted.
3. You should see the live camera feed with green lines (connections) and red dots (landmarks) overlaying detected hands.
4. A cyan rectangle shows the active area (calibration mode is on by default).
5. Press **P** to adjust the position or **S** to adjust the size of the active area using arrow keys.
6. When a hand is detected, the index fingertip shows both canvas and mapped coordinates.
7. Press **C** to toggle calibration mode off when you're ready to use the active area.

Notes and troubleshooting

- Browsers restrict camera access to secure contexts. If you open the file directly (file://), camera access may be blocked — use `http://localhost` or host it.
- If you see `createCanvas is not defined` or similar, make sure `libraries/p5.min.js` is loaded before `sketch.js` in `index.html` (this repo already does).
- Audio features (p5.sound) are included but not required by the sketch.

License
This example is provided as-is for learning and prototyping.
