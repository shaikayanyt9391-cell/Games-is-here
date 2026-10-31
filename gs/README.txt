Grand Syndicate: Indian Streets 3D
Run: serve this folder over HTTP (file:// will not work), e.g.
  python -m http.server 8000   ->  open http://localhost:8000
Needs internet once: three.js + cannon-es load from jsDelivr CDN (see importmap in index.html).
For fully offline play: download three@0.160.0 build/three.module.js and cannon-es@0.20.0 dist/cannon-es.js
into a /lib folder and point the importmap to them.
Keys: WASD/arrows move, Shift sprint, Space jump/wheelie/handbrake, E fire, F ride/exit, 1 weapon, P phone, X brake.
