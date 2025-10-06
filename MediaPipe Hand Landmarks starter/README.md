# MediaPipe Hand Landmarks — p5.js starter

This is a minimal, single-file p5.js sketch that demonstrates using MediaPipe Hands to detect hand landmarks from a webcam and draw them on a live canvas.

Key points

- Built with p5.js (global mode) and MediaPipe Hands (via CDN).
- The sketch captures webcam video using p5's `createCapture` and pipes frames to MediaPipe using the MediaPipe Camera utility.
- Detected hand landmarks and hand connections are drawn on top of the live video on a p5 canvas.

Files

- `index.html` — HTML entry. Loads p5, p5.sound (optional), MediaPipe scripts, and `sketch.js`. Also contains a short summary shown below the canvas.
- `sketch.js` — The p5 sketch and MediaPipe integration (setup, draw, and results handling).
- `style.css` — Minimal styling for canvas and the summary text.
- `libraries/` — Third-party libraries: `p5.min.js`, `p5.sound.min.js`.

How it works (short)

1. `sketch.js` creates a hidden p5 video capture (flipped for selfie mode).
2. MediaPipe Hands is configured and provided frames with the MediaPipe Camera util.
3. When MediaPipe returns landmark results, the sketch stores them and draws landmarks and connections on top of the video every frame.

Usage

1. Open `index.html` in a browser (preferably via a local server or `https`).
2. Allow camera access when prompted.
3. You should see the live camera feed with green lines (connections) and red dots (landmarks) overlaying detected hands.

Notes and troubleshooting

- Browsers restrict camera access to secure contexts. If you open the file directly (file://), camera access may be blocked — use `http://localhost` or host it.
- If you see `createCanvas is not defined` or similar, make sure `libraries/p5.min.js` is loaded before `sketch.js` in `index.html` (this repo already does).
- Audio features (p5.sound) are included but not required by the sketch.

License
This starter is provided as-is for learning and prototyping.
