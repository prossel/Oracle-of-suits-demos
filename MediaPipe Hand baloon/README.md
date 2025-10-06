# MediaPipe Hand Balloon (p5.js)

A small interactive p5.js sketch that uses MediaPipe Hands to detect your hand landmarks from your webcam and a physics-driven red balloon that falls and bounces. When you touch the balloon with your hand landmarks it gently rises. The video feed can be toggled with the `V` key.

Files
- `index.html` — loads p5 and MediaPipe, and runs `sketch.js`.
- `sketch.js` — main sketch: video capture, MediaPipe Hands setup, balloon physics, input handling.
- `style.css` — minimal CSS.
- `libraries/` — local copies of `p5.min.js` and `p5.sound.min.js`.

How it works
- The sketch uses p5.js for rendering and input.
- MediaPipe Hands runs in the browser (via the CDN) and returns hand landmarks each frame.
- A `Balloon` class simulates gravity, edge collisions, and landmark interactions. Touching a landmark gives the balloon a gentle upward velocity.

Controls
- `V` — toggle display of the webcam video (video shown by default).

Running locally
- For camera access, serve the folder over HTTPS or use a local server (most browsers block camera access from file://):

  python3 -m http.server 8000

  Then open `http://localhost:8000` in your browser.

Notes and tuning
- Tweak the balloon parameters in `sketch.js` (gravity, lift, collision radius) to change behaviour.
- The sketch loads MediaPipe from jsDelivr; ensure an internet connection when first loading.

License
- No license specified — use as you like.
