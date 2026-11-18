import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface KartView {
  progress: number;
  fuel: number;
  boost: boolean;
  color: string;
  lateral?: number;
  speed?: number;
  steer?: number;
}

function makeKart(color: string) {
  const group = new THREE.Group();
  const c = new THREE.Color(color);
  const bodyMat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.34, metalness: 0.35 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x101820, roughness: 0.7, metalness: 0.2 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.3, 1.9), bodyMat);
  body.position.y = 0.32;
  body.castShadow = true;
  group.add(body);
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.55), bodyMat);
  nose.position.set(0, 0.27, 1.08);
  nose.castShadow = true;
  group.add(nose);
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 10), dark);
  cockpit.scale.set(1, 0.85, 1.15);
  cockpit.position.set(0, 0.56, -0.18);
  group.add(cockpit);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), new THREE.MeshStandardMaterial({ color: 0xf5f7ef, roughness: 0.4 }));
  helmet.position.set(0, 0.82, -0.2);
  group.add(helmet);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.04), new THREE.MeshBasicMaterial({ color: 0x0a1510 }));
  visor.position.set(0, 0.82, -0.02);
  group.add(visor);
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.3), dark);
  spoiler.position.set(0, 0.68, -0.95);
  group.add(spoiler);
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.22, 14);
  for (const [x, z] of [[-0.62, 0.58], [0.62, 0.58], [-0.62, -0.62], [0.62, -0.62]] as [number, number][]) {
    const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0x070b0f, roughness: 0.9 }));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.25, z);
    wheel.castShadow = true;
    group.add(wheel);
    wheels.push(wheel);
  }
  const glow = new THREE.PointLight(c, 2.2, 4.5);
  glow.position.set(0, 0.22, 0);
  group.add(glow);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.5), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.18, side: THREE.DoubleSide }));
  under.rotation.x = -Math.PI / 2;
  under.position.y = 0.03;
  group.add(under);
  group.userData.wheels = wheels;
  group.userData.under = under;
  return group;
}

export function KartScene({
  preview = false,
  p1,
  p2,
  className,
  viewMode = 'split',
  viewer = 1,
}: {
  preview?: boolean;
  p1?: KartView;
  p2?: KartView;
  className?: string;
  viewMode?: 'split' | 'single';
  viewer?: 1 | 2;
}) {
  const host = useRef<HTMLDivElement>(null);
  const racers = useRef<{ p1?: KartView; p2?: KartView }>({ p1, p2 });
  racers.current = { p1, p2 };

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      el.innerHTML = '<div style="color:#93a8a1;font-size:12px;padding:20px">WebGL is not available in this browser. The 2D study modes still work.</div>';
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = false;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a10);
    scene.fog = new THREE.Fog(0x050a10, 35, 95);
    const cameraA = new THREE.PerspectiveCamera(62, 1, 0.1, 220);
    const cameraB = new THREE.PerspectiveCamera(62, 1, 0.1, 220);

    scene.add(new THREE.HemisphereLight(0xaed6ff, 0x0b1d14, 1.55));
    scene.add(new THREE.AmbientLight(0x6c8ca8, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 3.1);
    sun.position.set(18, 30, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    scene.add(sun);
    const neonA = new THREE.PointLight(0xb7f34a, 26, 40);
    neonA.position.set(-11, 8, -12);
    scene.add(neonA);
    const neonB = new THREE.PointLight(0x4de1c1, 22, 40);
    neonB.position.set(12, 7, 13);
    scene.add(neonB);

    // ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0x06110c, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

    // stars
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(360);
    for (let i = 0; i < 120; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 130;
      starPositions[i * 3 + 1] = 12 + Math.random() * 42;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 130;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xcfe7d7, size: 0.22, transparent: true, opacity: 0.7 })));

    // track curve
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9, 0, -10), new THREE.Vector3(0, 0, -14), new THREE.Vector3(9, 0, -10),
      new THREE.Vector3(14, 0, -2), new THREE.Vector3(10, 0, 8), new THREE.Vector3(2, 0, 14),
      new THREE.Vector3(-7, 0, 11), new THREE.Vector3(-14, 0, 3), new THREE.Vector3(-13, 0, -5),
    ], true, 'catmullrom', 0.35);
    const segments = 260;
    const halfWidth = 4.4;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const leftEdge: THREE.Vector3[] = [];
    const rightEdge: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const p = curve.getPointAt(t % 1);
      const tan = curve.getTangentAt(t % 1).normalize();
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      leftEdge.push(p.clone().addScaledVector(normal, halfWidth));
      rightEdge.push(p.clone().addScaledVector(normal, -halfWidth));
      vertices.push(p.x + normal.x * halfWidth, 0.02, p.z + normal.z * halfWidth);
      vertices.push(p.x - normal.x * halfWidth, 0.02, p.z - normal.z * halfWidth);
      uvs.push(0, t * 12, 1, t * 12);
    }
    for (let i = 0; i < segments; i++) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const roadGeo = new THREE.BufferGeometry();
    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);
    roadGeo.computeVertexNormals();
    const road = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({ color: 0x172531, roughness: 0.82, metalness: 0.22 }));
    road.receiveShadow = true;
    scene.add(road);

    // neon barriers
    const barrierGeo = new THREE.BoxGeometry(0.09, 0.34, 1);
    const barrierMatA = new THREE.MeshStandardMaterial({ color: 0xb7f34a, emissive: 0x7ea92f, emissiveIntensity: 0.8 });
    const barrierMatB = new THREE.MeshStandardMaterial({ color: 0x4de1c1, emissive: 0x1d8f7b, emissiveIntensity: 0.8 });
    for (let i = 0; i < segments; i += 2) {
      const p = leftEdge[i];
      const q = leftEdge[Math.min(i + 2, segments)];
      const mid = p.clone().add(q).multiplyScalar(0.5);
      const len = p.distanceTo(q);
      const bar = new THREE.Mesh(barrierGeo, barrierMatA);
      bar.position.set(mid.x, 0.18, mid.z);
      bar.scale.z = len;
      bar.rotation.y = Math.atan2(q.x - p.x, q.z - p.z);
      scene.add(bar);
      const bar2 = new THREE.Mesh(barrierGeo, barrierMatB);
      const p2L = rightEdge[i];
      const q2L = rightEdge[Math.min(i + 2, segments)];
      const mid2 = p2L.clone().add(q2L).multiplyScalar(0.5);
      bar2.position.set(mid2.x, 0.18, mid2.z);
      bar2.scale.z = p2L.distanceTo(q2L);
      bar2.rotation.y = Math.atan2(q2L.x - p2L.x, q2L.z - p2L.z);
      scene.add(bar2);
    }

    // lane dashes
    const dashMat = new THREE.MeshBasicMaterial({ color: 0x6e8d75 });
    for (let i = 0; i < segments; i += 8) {
      const p = curve.getPointAt((i / segments) % 1);
      const tan = curve.getTangentAt((i / segments) % 1).normalize();
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 0.72), dashMat);
      dash.position.set(p.x, 0.035, p.z);
      dash.rotation.y = Math.atan2(tan.x, tan.z);
      scene.add(dash);
    }

    // checker start line
    const checkerCanvas = document.createElement('canvas');
    checkerCanvas.width = 128; checkerCanvas.height = 32;
    const cctx = checkerCanvas.getContext('2d')!;
    for (let x = 0; x < 16; x++) for (let y = 0; y < 4; y++) {
      cctx.fillStyle = (x + y) % 2 ? '#e8f4dc' : '#0b1014';
      cctx.fillRect(x * 8, y * 8, 8, 8);
    }
    const checkerTexture = new THREE.CanvasTexture(checkerCanvas);
    const startGroup = new THREE.Group();
    const startAsset = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 1.2), new THREE.MeshBasicMaterial({ map: checkerTexture }));
    startAsset.rotation.x = -Math.PI / 2;
    startAsset.position.y = 0.04;
    startGroup.add(startAsset);
    const startPoint = curve.getPointAt(0.006);
    const startTan = curve.getTangentAt(0.006);
    startGroup.position.set(startPoint.x, 0, startPoint.z);
    startGroup.rotation.y = -Math.atan2(startTan.x, startTan.z);
    scene.add(startGroup);

    // trackside trees and stands
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2e2118, roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x103a22, roughness: 0.9 });
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 20 + (i % 4) * 2.4;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6), trunkMat);
      trunk.position.y = 0.7;
      tree.add(trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.1 + (i % 3) * 0.2, 2.8, 7), leafMat);
      crown.position.y = 2.3;
      crown.castShadow = true;
      tree.add(crown);
      tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      scene.add(tree);
    }
    const standMat = new THREE.MeshStandardMaterial({ color: 0x0d1a21, roughness: 0.8, metalness: 0.3 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffd36b });
    for (let s = 0; s < 3; s++) {
      const angle = 0.7 + s * 1.9;
      const stand = new THREE.Group();
      for (let row = 0; row < 4; row++) {
        const block = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 0.8), standMat);
        block.position.set(0, 0.25 + row * 0.45, row * 0.7);
        stand.add(block);
        for (let k = 0; k < 8; k++) {
          const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.06), lightMat);
          lamp.position.set(-3.4 + k * 0.95, 0.6 + row * 0.45, row * 0.7);
          stand.add(lamp);
        }
      }
      stand.position.set(Math.cos(angle) * 18, 0, Math.sin(angle) * 18);
      stand.rotation.y = -angle + Math.PI / 2;
      scene.add(stand);
    }

    // karts
    const kartA = makeKart(p1?.color ?? '#b7f34a');
    const kartB = makeKart(p2?.color ?? '#4de1c1');
    scene.add(kartA, kartB);
    let lastA = 0;

    const resize = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 420;
      renderer.setSize(w, h, false);
      if (preview) {
        cameraA.aspect = w / h;
        cameraA.updateProjectionMatrix();
      } else if (w < 720) {
        cameraA.aspect = w / (h / 2);
        cameraB.aspect = w / (h / 2);
        cameraA.updateProjectionMatrix();
        cameraB.updateProjectionMatrix();
      } else {
        cameraA.aspect = w / 2 / h;
        cameraB.aspect = w / 2 / h;
        cameraA.updateProjectionMatrix();
        cameraB.updateProjectionMatrix();
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener('resize', resize);

    const posFor = (view: KartView | undefined, lane: number, t: number) => {
      const p = curve.getPointAt((view?.progress ?? t) % 1);
      const tan = curve.getTangentAt((view?.progress ?? t) % 1).normalize();
      const normal = new THREE.Vector3(-tan.z, 0, tan.x).normalize();
      return { p: p.clone().addScaledVector(normal, view?.lateral ?? lane), tan, normal };
    };
    const placeKart = (kart: THREE.Group, view: KartView | undefined, lane: number, t: number, dt: number) => {
      const { p, tan } = posFor(view, lane, t);
      kart.position.set(p.x, 0.02, p.z);
      kart.rotation.y = Math.atan2(tan.x, tan.z);
      kart.rotation.z = -(view?.steer ?? 0) * 0.07 * Math.min(1, (view?.speed ?? 0) / 8);
      const wheels = kart.userData.wheels as THREE.Mesh[];
      const speed = view && view.fuel > 0 ? 6 + (view.boost ? 4 : 0) : 1;
      kart.userData.wheelSpin = ((kart.userData.wheelSpin as number) ?? 0) + speed * dt;
      wheels.forEach((w, i) => {
        w.rotation.x = (kart.userData.wheelSpin as number) * (i % 2 ? 1 : 1);
      });
      const under = kart.userData.under as THREE.Mesh;
      under.material = under.material as THREE.MeshBasicMaterial;
      (under.material as THREE.MeshBasicMaterial).opacity = view && view.boost ? 0.4 : 0.18;
      kart.position.y = 0.02 + Math.sin(performance.now() * 0.01) * 0.008;
    };

    let raf = 0;
    const start = performance.now();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastA) / 1000 || 0.016);
      lastA = now;
      if (preview) {
        const t = (now - start) / 1000;
        placeKart(kartA, undefined, 1.25, (t * 0.055) % 1, dt);
        placeKart(kartB, undefined, -1.25, (t * 0.055 + 0.07) % 1, dt);
        const a = t * 0.12;
        cameraA.position.set(Math.sin(a) * 25, 14, Math.cos(a) * 25);
        cameraA.lookAt(0, 0, 0);
        const w = el.clientWidth || 800;
        const h = el.clientHeight || 420;
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, w, h);
        renderer.clear();
        renderer.render(scene, cameraA);
      } else {
        placeKart(kartA, racers.current.p1, 1.35, 0, dt);
        placeKart(kartB, racers.current.p2, -1.35, 0.05, dt);
        const follow = (camera: THREE.PerspectiveCamera, view: KartView | undefined, lane: number, t: number) => {
          const { p, tan } = posFor(view, lane, t);
          const speed = view?.speed ?? 0;
          const desired = p.clone().addScaledVector(tan, -5.6 - Math.min(1.8, speed * 0.08)).add(new THREE.Vector3(0, 2.8 + Math.min(0.5, speed * 0.03), 0));
          camera.position.lerp(desired, 0.18);
          camera.fov += ((58 + Math.min(14, speed * 1.2)) - camera.fov) * 0.08;
          camera.updateProjectionMatrix();
          camera.lookAt(p.clone().addScaledVector(tan, 6).add(new THREE.Vector3(0, 1.0, 0)));
        };
        follow(cameraA, racers.current.p1, 1.35, 0);
        follow(cameraB, racers.current.p2, -1.35, 0.05);
        const w = el.clientWidth || 800;
        const h = el.clientHeight || 420;
        if (viewMode === 'single') {
          renderer.setScissorTest(false);
          renderer.setViewport(0, 0, w, h);
          renderer.clear();
          renderer.render(scene, viewer === 1 ? cameraA : cameraB);
        } else {
          renderer.setScissorTest(true);
          if (w < 720) {
            renderer.setViewport(0, h / 2, w, h / 2);
            renderer.setScissor(0, h / 2, w, h / 2);
            renderer.clear();
            renderer.render(scene, cameraA);
            renderer.setViewport(0, 0, w, h / 2);
            renderer.setScissor(0, 0, w, h / 2);
            renderer.clear();
            renderer.render(scene, cameraB);
          } else {
            renderer.setViewport(0, 0, w / 2, h);
            renderer.setScissor(0, 0, w / 2, h);
            renderer.clear();
            renderer.render(scene, cameraA);
            renderer.setViewport(w / 2, 0, w / 2, h);
            renderer.setScissor(w / 2, 0, w / 2, h);
            renderer.clear();
            renderer.render(scene, cameraB);
          }
          renderer.setScissorTest(false);
        }
      }
    };
    animate();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
    };
  }, [preview, viewMode, viewer]);

  return <div ref={host} className={className ?? 'h-full w-full'} aria-label="3D kart racing scene" />;
}