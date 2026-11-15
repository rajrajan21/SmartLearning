// Malar Teacher 3D avatar renderer: loads an original GLB teacher and drives speech mouth shapes.
import * as THREE from 'three';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
const VIS = ['aa','E','I','O','U','PP','SS','TH','CH','FF','kk','nn','RR','DD'];
export class Avatar {
  constructor(canvas) {
    this.r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.r.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.r.outputColorSpace = THREE.SRGBColorSpace; this.r.toneMapping = THREE.ACESFilmicToneMapping; this.r.toneMappingExposure = 0.92;
    this.scene = new THREE.Scene();
    this.cam = new THREE.PerspectiveCamera(24, 1, 0.1, 10); this.cam.position.set(0, 0.03, 1.12); this.cam.lookAt(0, -0.02, 0);
    try { this.scene.environment = new THREE.PMREMGenerator(this.r).fromScene(new RoomEnvironment(), 0.04).texture; this.scene.environmentIntensity = 0.5; } catch (e) {}
    this.scene.add(new THREE.HemisphereLight(0xfff4e6, 0x6b5a4a, 0.7));
    const key = new THREE.DirectionalLight(0xfff1e0, 2.0); key.position.set(0.8, 1.0, 2); this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdde8ff, 0.9); fill.position.set(-1.5, 0.3, 1); this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.5); rim.position.set(0, 1.2, -2); this.scene.add(rim);
    this.meshes = []; this.val = {}; this.cur = {}; this.timeline = null; this.clock = null; this.talking = false; this.mood = { smile: 0.35, browUp: 0 };
    this.look = 0; this.lookCur = 0; this.scene3 = 'talk'; this.zoom = 0; this.bones = {}; this.ang = {}; this.nextBlink = 1500; this.blinkAt = -1; this.root = null; this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loop = t => { this.frame(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  }
  async load(url) {
    const g = await new GLTFLoader().loadAsync(url);
    if (this.root) { this.scene.remove(this.root); this.root.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.map && o.material.map.dispose(); o.material.dispose(); } }); }
    this.root = g.scene; this.meshes = []; this.bones = {}; this.ang = {};
    g.scene.traverse(o => { if (o.isBone) this.bones[o.name] = o; });
    g.scene.traverse(o => { if (!o.isMesh) return; const m = o.material, n = o.name; o.frustumCulled = false;
      if (n === 'hair') { m.alphaTest = 0.3; m.transparent = false; m.side = THREE.DoubleSide; m.roughness = 0.8; }
      if (n === 'eyelashes' || n === 'eyebrows') { m.transparent = true; m.depthWrite = false; o.renderOrder = 2; }
      if (n === 'saree') { m.side = THREE.DoubleSide; }
      if (n === 'eyes') { m.roughness = 0.08; m.envMapIntensity = 1; }
      if (o.morphTargetDictionary) this.meshes.push(o); });
    this.scene.add(g.scene);
  }
  // 'talk' = news-reader close-up, 'board' = wide shot with the arm raised to the board
  setScene(s) { this.scene3 = s; }
  pose(t) {
    const B = this.bones; if (!B.upperarm_l) return;
    const board = this.scene3 === 'board', g = this.talking && !board && Math.sin(t / 1700) > 0.2 ? 1 : 0, g2 = this.talking && !board && Math.sin(t / 2600 + 1) > 0.55 ? 1 : 0, wob = Math.sin(t / 190), wob2 = Math.cos(t / 260);
    // rest pose is an A-pose (arms about 45 degrees down): +z lowers the right arm, -z raises it; mirrored for the left
    const T = {  // teacher stands on the left, board is on the right: the left arm goes to the board, the right hand gestures
      // with the arm hanging, bending the elbow forward is a rotation about the sideways (x) axis
      upperarm_r: [-0.18 * g, 0, 0.58], lowerarm_r: [-(1.25 + 0.14 * Math.sin(t / 420)) * g, 0.1 + 0.25 * g, 0],
      upperarm_l: board ? [0, -0.2 - 0.04 * wob2, 0.95 - 0.06 * wob] : [-0.15 * g2, 0, -0.58], lowerarm_l: board ? [0, -0.08 * wob, 0.15] : [-(1.1 + 0.1 * Math.sin(t / 510)) * g2, -0.1 - 0.25 * g2, 0],
      spine_03: [0, board ? -0.15 : 0, 0],
      // small living-body motion: breathing and a slow shift of weight
      spine_01: [0.012 * Math.sin(t / 1500), 0, 0.018 * Math.sin(t / 2700)], spine_02: [0.01 * Math.sin(t / 1500 + 0.6), 0.02 * Math.sin(t / 3900), 0],
      clavicle_l: [0, 0, 0.025 * Math.sin(t / 1500)], clavicle_r: [0, 0, -0.025 * Math.sin(t / 1500)]
    };
    // fingers: relaxed curl normally; on the board arm the index finger stays straight to point
    const fc = this.fc || (this.fc = { p: 0 }); fc.p += ((board ? 1 : 0) - fc.p) * this.k(0.07);
    const curl = (side, sg, amt, names) => names.forEach(f => [1, 2, 3].forEach(i => { const b = B[f + '_0' + i + '_' + side]; if (b) b.rotation.z = sg * amt; }));
    curl('l', -1, 0.9 * fc.p, ['middle', 'ring', 'pinky']);
    for (const n in T) { const b = B[n]; if (!b) continue; const c = this.ang[n] || (this.ang[n] = T[n].slice());
      for (let i = 0; i < 3; i++) c[i] += (T[n][i] - c[i]) * this.k(0.07); b.rotation.set(c[0], c[1], c[2]); }
  }
  resize() { const c = this.r.domElement, w = c.clientWidth, h = c.clientHeight; if (!w || !h) return; if (c.width !== Math.round(w * this.r.getPixelRatio()) || this._h !== h) { this.r.setSize(w, h, false); this._h = h; this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); } }
  // timeline: {visemes:[..], vtimes:[ms], vdurations:[ms]}, clock(): ms since the audio started
  speak(timeline, clock) { this.timeline = timeline; this.clock = clock; this.talking = true; this.ti = 0; }
  stop() { this.timeline = null; this.talking = false; }
  frame(t) {
    const dt = Math.min(100, t - (this.last || t)); this.last = t; this.k = r => 1 - Math.pow(1 - r, dt / 16.7);
    this.resize(); this.pose(t);
    this.zoom += ((this.scene3 === 'board' ? 1 : 0) - this.zoom) * this.k(0.045); const z = this.zoom, wide = this.cam.aspect > 1.4;
    const dist = 1.12 + (wide ? 1.25 : 0.9) * z; this.cam.position.set(0, 0.03 - 0.17 * z, dist); this.cam.lookAt(0, -0.02 - 0.2 * z, 0);
    if (this.root) { this.root.position.x = wide ? -0.58 * Math.tan(this.cam.fov * Math.PI / 360) * dist * this.cam.aspect : 0;
      // she stands left of centre, so turn her body toward the camera: her eyes meet the viewer instead of looking past them
      this.root.rotation.y = Math.atan2(-this.root.position.x, dist) * (1 - 0.4 * z); }
    const v = this.val; for (const k of VIS) v['viseme_' + k] = 0;
    if (this.timeline) { const tl = this.timeline, now = this.clock(), R = 55;
      while (this.ti < tl.vtimes.length && tl.vtimes[this.ti] + tl.vdurations[this.ti] + R < now) this.ti++;
      for (let i = this.ti; i < tl.vtimes.length && tl.vtimes[i] - R < now; i++) { const s = tl.vtimes[i], e = s + tl.vdurations[i];
        const d = now < s ? s - now : now > e ? now - e : 0, w = Math.max(0, 1 - d / R), k = 'viseme_' + tl.visemes[i];
        if (k in v) v[k] = Math.max(v[k], w * 0.95); } }
    if (t > this.nextBlink) { this.blinkAt = t; this.nextBlink = t + 2200 + Math.random() * 3200; }
    const b = (t - this.blinkAt) / 150; v.blink = b >= 0 && b < 1 ? Math.sin(b * Math.PI) : 0;
    v.smile = this.mood.smile; v.blink = Math.max(v.blink, 0.1); v.browUp = this.mood.browUp; v.browDown = 0;
    const k = this.reduced ? 0 : 1, a = this.talking ? 1 : 0.45;
    this.lookCur += (this.look - this.lookCur) * this.k(0.05);
    v.headYaw = k * a * (0.35 * Math.sin(t / 1900) + 0.15 * Math.sin(t / 730)) + this.lookCur * 0.9;
    v.headPitch = k * a * (0.25 * Math.sin(t / 1300 + 1) + (this.talking ? 0.12 * Math.sin(t / 310) : 0));
    v.headRoll = k * a * 0.3 * Math.sin(t / 2700 + 2);
    for (const n in v) { const fast = n.startsWith('viseme_') || n === 'blink'; this.cur[n] = (this.cur[n] || 0) + (v[n] - (this.cur[n] || 0)) * this.k(fast ? 0.55 : 0.08); }
    for (const m of this.meshes) for (const n in m.morphTargetDictionary) m.morphTargetInfluences[m.morphTargetDictionary[n]] = this.cur[n] || 0;
    this.r.render(this.scene, this.cam);
  }
}
