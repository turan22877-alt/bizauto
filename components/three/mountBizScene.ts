import * as THREE from 'three';

function disposeObjectTree(root: THREE.Object3D) {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry?.dispose();
      const mat = child.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    }
  });
}

export type BizSceneMode = 'auth' | 'dashboard';

/** Монтирует WebGL-сцену в контейнер; возвращает функцию очистки (без React Three Fiber). */
export function mountBizScene(container: HTMLElement, mode: BizSceneMode): () => void {
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mode === 'auth' ? 40 : 42, width / height, 0.1, 100);
  if (mode === 'auth') {
    camera.position.set(0, 0.2, 7.2);
  } else {
    camera.position.set(0, 0, 5.2);
  }

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mode === 'auth' ? 1.75 : 1.5));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, mode === 'auth' ? 0.4 : 0.45));

  if (mode === 'auth') {
    const spot = new THREE.SpotLight(0xffa500, 1.15, 0, 0.35, 0.6);
    spot.position.set(8, 10, 6);
    scene.add(spot);
    const p1 = new THREE.PointLight(0xffd700, 0.85, 0, 2);
    p1.position.set(-6, 4, -4);
    scene.add(p1);
    const p2 = new THREE.PointLight(0xff8c00, 0.5, 0, 2);
    p2.position.set(4, -2, 6);
    scene.add(p2);
  } else {
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(4, 6, 4);
    scene.add(dir);
    const p = new THREE.PointLight(0xffa500, 0.8, 0, 2);
    p.position.set(0, 2, 4);
    scene.add(p);
  }

  const animGroups: THREE.Group[] = [];

  if (mode === 'auth') {
    const gKnot = new THREE.Group();
     const knot = new THREE.Mesh(
       new THREE.TorusKnotGeometry(1, 0.26, 120, 24),
       new THREE.MeshStandardMaterial({
         color: 0x431407,
         emissive: 0xea580c,
         emissiveIntensity: 0.35,
         metalness: 0.9,
         roughness: 0.15,
       })
     );
    knot.scale.setScalar(1.15);
    gKnot.add(knot);
    scene.add(gKnot);
    animGroups.push(gKnot);

    const gIco = new THREE.Group();
     const ico = new THREE.Mesh(
       new THREE.IcosahedronGeometry(0.82, 0),
       new THREE.MeshStandardMaterial({
         color: 0xea580c,
         emissive: 0xf97316,
         emissiveIntensity: 0.45,
         metalness: 0.78,
         roughness: 0.18,
       })
     );
    ico.position.set(3.2, 0.8, -1.8);
    ico.rotation.set(0.4, 0.7, 0);
    gIco.add(ico);
    scene.add(gIco);
    animGroups.push(gIco);

    const gRing = new THREE.Group();
     const ring = new THREE.Mesh(
       new THREE.TorusGeometry(1.35, 0.04, 16, 80),
       new THREE.MeshStandardMaterial({
         color: 0xf97316,
         emissive: 0xea580c,
         emissiveIntensity: 0.4,
         metalness: 0.92,
         roughness: 0.12,
       })
     );
    ring.position.set(-3, -0.6, -2);
    ring.rotation.set(1.1, 0, 0.5);
    gRing.add(ring);
    scene.add(gRing);
    animGroups.push(gRing);
  } else {
    const gMain = new THREE.Group();
     const torus = new THREE.Mesh(
       new THREE.TorusGeometry(1.05, 0.32, 32, 64),
       new THREE.MeshStandardMaterial({
         color: 0x431407,
         emissive: 0xea580c,
         emissiveIntensity: 0.28,
         metalness: 0.9,
         roughness: 0.18,
       })
     );
     const oct = new THREE.Mesh(
       new THREE.OctahedronGeometry(0.55, 0),
       new THREE.MeshStandardMaterial({
         color: 0xea580c,
         emissive: 0xf97316,
         emissiveIntensity: 0.38,
         metalness: 0.72,
         roughness: 0.22,
       })
     );
    oct.position.set(1.85, 0.4, -0.6);
    gMain.add(torus);
    gMain.add(oct);
    scene.add(gMain);
    animGroups.push(gMain);
  }

  const t0 = performance.now();
  let raf = 0;
  let last = t0;

  const speeds = mode === 'auth' ? [1.35, 1.1, 0.95] : [1.5];
  const amps = mode === 'auth' ? [0.14, 0.1, 0.08] : [0.08];
  /** рад/с — плавное вращение */
  const rotYVel = mode === 'auth' ? [0.35, -0.28, 0.18] : [0.55];

  const tick = () => {
    raf = requestAnimationFrame(tick);
    const now = performance.now();
    const delta = Math.min((now - last) / 1000, 0.064);
    last = now;
    const t = (now - t0) / 1000;
    animGroups.forEach((g, i) => {
      const s = speeds[Math.min(i, speeds.length - 1)] ?? 1.2;
      const a = amps[Math.min(i, amps.length - 1)] ?? 0.1;
      const w = rotYVel[Math.min(i, rotYVel.length - 1)] ?? 0.2;
      g.position.y = Math.sin(t * s) * a;
      g.rotation.x = Math.sin(t * 0.65) * 0.07;
      g.rotation.z = Math.cos(t * 0.5) * 0.03;
      g.rotation.y += w * delta;
    });
    renderer.render(scene, camera);
  };
  tick();

  const ro = new ResizeObserver(() => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);

  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    disposeObjectTree(scene);
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };
}
