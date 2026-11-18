import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

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
  const bodyMat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.28, metalness: 0.5 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x10151c, roughness: 0.55, metalness: 0.55 });
  const carbon = new THREE.MeshStandardMaterial({ color: 0x161a20, roughness: 0.38, metalness: 0.6 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 1 });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xb7c2c9, roughness: 0.2, metalness: 0.95 });
  const suit = new THREE.MeshStandardMaterial({ color: 0x121a22, roughness: 0.75 });
  const helmetMat = new THREE.MeshStandardMaterial({ color: 0xf4f6ef, roughness: 0.24, metalness: 0.15 });

  const chassis = new THREE.Mesh(new RoundedBoxGeometry(1.16, 0.28, 1.95, 4, 0.12), bodyMat);
  chassis.position.y = 0.3; chassis.castShadow = true; group.add(chassis);

  const nose = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.18, 0.7, 4, 0.08), bodyMat);
  nose.position.set(0, 0.28, 1.12); nose.castShadow = true; group.add(nose);
  const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.35, 4), bodyMat);
  noseTip.rotation.x = -Math.PI / 2; noseTip.rotation.z = Math.PI / 4; noseTip.position.set(0, 0.28, 1.54); noseTip.castShadow = true; group.add(noseTip);

  const floor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 2.15), carbon);
  floor.position.y = 0.18; floor.castShadow = true; group.add(floor);

  const cockpit = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.18, 0.72, 3, 0.07), dark);
  cockpit.position.set(0, 0.47, -0.12); group.add(cockpit);
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.45, 0.15, 3, 0.05), dark);
  seat.position.set(0, 0.65, -0.42); seat.rotation.x = -0.2; group.add(seat);
  const torso = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.46, 0.26, 3, 0.06), suit);
  torso.position.set(0, 0.65, -0.2); group.add(torso);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), helmetMat);
  helmet.scale.set(1, 0.9, 1.08); helmet.position.set(0, 0.91, -0.18); helmet.castShadow = true; group.add(helmet);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.095, 0.05), new THREE.MeshStandardMaterial({ color: 0x07150f, roughness: 0.1, metalness: 0.9 }));
  visor.position.set(0, 0.91, 0.0); group.add(visor);

  const engine = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.28, 0.45), dark);
  engine.position.set(0, 0.46, -0.82); engine.castShadow = true; group.add(engine);
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.34, 8), chrome);
  exhaust.rotation.x = Math.PI / 2; exhaust.position.set(0.16, 0.48, -1.08); group.add(exhaust);
  const exhaust2 = exhaust.clone(); exhaust2.position.x = -0.16; group.add(exhaust2);

  const sidePodL = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.22, 0.72, 3, 0.06), bodyMat);
  sidePodL.position.set(-0.66, 0.32, -0.12); sidePodL.castShadow = true; group.add(sidePodL);
  const sidePodR = sidePodL.clone(); sidePodR.position.x = 0.66; group.add(sidePodR);

  const frontWing = new THREE.Mesh(new RoundedBoxGeometry(1.48, 0.06, 0.3, 2, 0.04), carbon);
  frontWing.position.set(0, 0.18, 1.36); group.add(frontWing);
  const rearWing = new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.07, 0.35, 2, 0.04), carbon);
  rearWing.position.set(0, 0.78, -1.03); group.add(rearWing);
  const rearWingPostL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.38, 0.1), carbon);
  rearWingPostL.position.set(-0.36, 0.57, -1.02); group.add(rearWingPostL);
  const rearWingPostR = rearWingPostL.clone(); rearWingPostR.position.x = 0.36; group.add(rearWingPostR);

  const steering = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 6, 16), dark);
  steering.rotation.x = Math.PI / 2.8; steering.position.set(0, 0.7, 0.22); group.add(steering);

  const wheels: THREE.Group[] = [];
  const frontWheels: THREE.Group[] = [];
  const makeWheel = (front: boolean) => {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.24, 18), rubber);
    tire.rotation.z = Math.PI / 2; tire.castShadow = true; wheel.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.155, 0.25, 14), chrome);
    rim.rotation.z = Math.PI / 2; wheel.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.27, 10), dark);
    hub.rotation.z = Math.PI / 2; wheel.add(hub);
    if (front) frontWheels.push(wheel);
    wheels.push(wheel);
    return wheel;
  };
  const fl = makeWheel(true); fl.position.set(-0.66, 0.27, 0.72); group.add(fl);
  const fr = makeWheel(true); fr.position.set(0.66, 0.27, 0.72); group.add(fr);
  const rl = makeWheel(false); rl.position.set(-0.68, 0.3, -0.72); group.add(rl);
  const rr = makeWheel(false); rr.position.set(0.68, 0.3, -0.72); group.add(rr);

  const headlightMat = new THREE.MeshStandardMaterial({ color: 0xfff2c4, emissive: 0xffd36b, emissiveIntensity: 2.2 });
  const headL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.04), headlightMat);
  headL.position.set(-0.32, 0.36, 1.47); group.add(headL);
  const headR = headL.clone(); headR.position.x = 0.32; group.add(headR);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0xff3322, emissive: 0xaa1208, emissiveIntensity: 2.5 }));
  tail.position.set(0, 0.44, -1.18); group.add(tail);

  const numberCanvas = document.createElement('canvas');
  numberCanvas.width = 128; numberCanvas.height = 128;
  const nctx = numberCanvas.getContext('2d')!;
  nctx.fillStyle = '#0b1117'; nctx.fillRect(0, 0, 128, 128);
  nctx.fillStyle = color; nctx.font = 'bold 82px sans-serif'; nctx.textAlign = 'center'; nctx.textBaseline = 'middle'; nctx.fillText('1', 64, 68);
  const numberTexture = new THREE.CanvasTexture(numberCanvas);
  const numberPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshStandardMaterial({ map: numberTexture, roughness: 0.6 }));
  numberPlate.position.set(0, 0.36, 1.22); group.add(numberPlate);

  const glow = new THREE.PointLight(c, 2.4, 5);
  glow.position.set(0, 0.2, 0); group.add(glow);
  const under = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.62), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.22, side: THREE.DoubleSide }));
  under.rotation.x = -Math.PI / 2; under.position.y = 0.035; group.add(under);

  group.userData.wheels = wheels;
  group.userData.frontWheels = frontWheels;
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
    renderer.toneMappingExposure = 0.85;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = false;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.Fog(0xc3dbe6, 75, 180);
    const sky = new Sky();
    sky.scale.setScalar(900);
    scene.add(sky);
    const skyUniforms = (sky.material as THREE.ShaderMaterial).uniforms;
    skyUniforms.turbidity.value = 4.2;
    skyUniforms.rayleigh.value = 1.55;
    skyUniforms.mieCoefficient.value = 0.005;
    skyUniforms.mieDirectionalG.value = 0.8;
    const sunDir = new THREE.Vector3();
    sunDir.setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 34), THREE.MathUtils.degToRad(208));
    skyUniforms.sunPosition.value.copy(sunDir);
    const cameraA = new THREE.PerspectiveCamera(62, 1, 0.1, 220);
    const cameraB = new THREE.PerspectiveCamera(62, 1, 0.1, 220);

    scene.add(new THREE.HemisphereLight(0xaed6ff, 0x0b1d14, 1.55));
    scene.add(new THREE.AmbientLight(0x8fb0c5, 0.85));
    const sun = new THREE.DirectionalLight(0xfff5e0, 3.1);
    sun.position.copy(sunDir).multiplyScalar(60);
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
    const grassCanvas = document.createElement('canvas');
    grassCanvas.width = 256; grassCanvas.height = 256;
    const gctx = grassCanvas.getContext('2d')!;
    gctx.fillStyle = '#2f5a35'; gctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 7000; i++) {
      const g = 55 + Math.floor(Math.random() * 55);
      gctx.fillStyle = `rgba(${18 + Math.floor(Math.random() * 26)},${g},${26 + Math.floor(Math.random() * 22)},${0.2 + Math.random() * 0.4})`;
      gctx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 3);
    }
    for (let i = 0; i < 14; i++) {
      gctx.fillStyle = `rgba(255,255,255,${0.025 + Math.random() * 0.02})`;
      gctx.fillRect(0, i * 18, 256, 9);
    }
    const grassTexture = new THREE.CanvasTexture(grassCanvas);
    grassTexture.wrapS = THREE.RepeatWrapping; grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(38, 38); grassTexture.colorSpace = THREE.SRGBColorSpace;
    grassTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshStandardMaterial({ color: 0xffffff, map: grassTexture, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = true;
    scene.add(ground);

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
    const asphaltCanvas = document.createElement('canvas');
    asphaltCanvas.width = 256; asphaltCanvas.height = 256;
    const actx = asphaltCanvas.getContext('2d')!;
    actx.fillStyle = '#3d454a'; actx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      const v = 35 + Math.floor(Math.random() * 50);
      actx.fillStyle = `rgba(${v},${v + 2},${v + 3},${0.15 + Math.random() * 0.25})`;
      actx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    actx.strokeStyle = 'rgba(12,15,17,0.18)'; actx.lineWidth = 1;
    for (let i = 0; i < 8; i++) { actx.beginPath(); actx.moveTo(Math.random() * 256, 0); actx.lineTo(Math.random() * 256, 256); actx.stroke(); }
    const asphaltTexture = new THREE.CanvasTexture(asphaltCanvas);
    asphaltTexture.wrapS = THREE.RepeatWrapping; asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(1.5, 7); asphaltTexture.colorSpace = THREE.SRGBColorSpace;
    asphaltTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const road = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, map: asphaltTexture, roughness: 0.92, metalness: 0.05 }));
    road.receiveShadow = true;
    scene.add(road);

    const edgeLineMat = new THREE.MeshStandardMaterial({ color: 0xeff4ec, roughness: 0.65 });
    const edgeLineGeo = new THREE.BoxGeometry(0.11, 0.016, 1);
    for (let i = 0; i < segments; i += 6) {
      for (const edge of [leftEdge, rightEdge]) {
        const a = edge[i]; const b = edge[Math.min(i + 6, segments)];
        if (!a || !b) continue;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const line = new THREE.Mesh(edgeLineGeo, edgeLineMat);
        line.position.set(mid.x, 0.055, mid.z);
        line.scale.z = a.distanceTo(b);
        line.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
        scene.add(line);
      }
    }

    const curbMats = [
      new THREE.MeshStandardMaterial({ color: 0xd9413d, roughness: 0.7 }),
      new THREE.MeshStandardMaterial({ color: 0xf1f4ec, roughness: 0.7 }),
    ];
    for (let i = 0; i < segments; i += 4) {
      for (const edge of [leftEdge, rightEdge]) {
        const a = edge[i];
        const b = edge[Math.min(i + 4, segments)];
        if (!a || !b) continue;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.09, a.distanceTo(b) + 0.25), curbMats[(i / 4) % 2]);
        curb.position.set(mid.x, 0.045, mid.z);
        curb.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
        curb.receiveShadow = true;
        scene.add(curb);
      }
    }

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
    startGroup.rotation.y = Math.atan2(startTan.x, startTan.z);
    scene.add(startGroup);

    // two one-sided faces so sponsor text reads correctly from either side
    const twoSidedBoard = (width: number, height: number, material: THREE.Material) => {
      const group = new THREE.Group();
      const front = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      back.rotation.y = Math.PI;
      back.position.z = -0.012;
      group.add(front, back);
      return group;
    };

    // start gantry
    const gantry = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0x222b33, roughness: 0.5, metalness: 0.7 });
    const postGeo = new THREE.BoxGeometry(0.34, 6.2, 0.34);
    const postL = new THREE.Mesh(postGeo, steel); postL.position.set(-5.2, 3.1, 0); postL.castShadow = false; gantry.add(postL);
    const postR = postL.clone(); postR.position.x = 5.2; gantry.add(postR);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(10.7, 0.45, 0.4), steel); beam.position.y = 6.1; gantry.add(beam);
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024; bannerCanvas.height = 192;
    const bctx = bannerCanvas.getContext('2d')!;
    const bg = bctx.createLinearGradient(0, 0, 1024, 0); bg.addColorStop(0, '#0b1510'); bg.addColorStop(0.5, '#162b19'); bg.addColorStop(1, '#0b1510');
    bctx.fillStyle = bg; bctx.fillRect(0, 0, 1024, 192);
    bctx.strokeStyle = '#b7f34a'; bctx.lineWidth = 6; bctx.strokeRect(4, 4, 1016, 184);
    bctx.fillStyle = '#eaffd0'; bctx.font = 'bold 92px sans-serif'; bctx.textAlign = 'center'; bctx.fillText('TROPHIC GP', 512, 124);
    bctx.fillStyle = '#b7f34a'; bctx.font = 'bold 24px sans-serif'; bctx.fillText('ECOLOGY CIRCUIT', 512, 164);
    const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
    const banner = twoSidedBoard(9.4, 1.75, new THREE.MeshStandardMaterial({ map: bannerTexture, emissive: 0x1a3014, emissiveIntensity: 0.5, side: THREE.FrontSide }));
    banner.position.set(0, 5.1, 0); gantry.add(banner);
    const gantryLightMat = new THREE.MeshStandardMaterial({ color: 0xffe6a3, emissive: 0xffd36b, emissiveIntensity: 2 });
    for (let k = 0; k < 8; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.1), gantryLightMat); l.position.set(-4.2 + k * 1.2, 6.36, -0.23); gantry.add(l); }
    gantry.position.set(startPoint.x, 0, startPoint.z);
    gantry.rotation.y = Math.atan2(startTan.x, startTan.z);
    scene.add(gantry);

    // billboards around the circuit
    const billboardData = [
      { text: 'ANSWER TO FUEL', color: '#b7f34a', t: 0.28 },
      { text: 'ECOLOGY GP', color: '#4de1c1', t: 0.54 },
      { text: 'TROPHIC', color: '#ffc24b', t: 0.78 },
    ];
    for (const bb of billboardData) {
      const bp = curve.getPointAt(bb.t);
      const bt = curve.getTangentAt(bb.t);
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
      const cx = canvas.getContext('2d')!;
      cx.fillStyle = '#0a1117'; cx.fillRect(0, 0, 512, 128);
      cx.strokeStyle = bb.color; cx.lineWidth = 5; cx.strokeRect(3, 3, 506, 122);
      cx.fillStyle = bb.color; cx.font = 'bold 50px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(bb.text, 256, 66);
      const tx = new THREE.CanvasTexture(canvas);
      const board = twoSidedBoard(4.6, 1.15, new THREE.MeshStandardMaterial({ map: tx, emissive: 0x08110a, emissiveIntensity: 0.4, side: THREE.FrontSide }));
      const normal = new THREE.Vector3(-bt.z, 0, bt.x).normalize();
      board.position.copy(bp).addScaledVector(normal, 8.2);
      board.position.y = 2.2;
      board.rotation.y = Math.atan2(bt.z, -bt.x);
      scene.add(board);
      const boardYaw = Math.atan2(bt.z, -bt.x);
      const boardRight = new THREE.Vector3(Math.cos(boardYaw), 0, -Math.sin(boardYaw));
      for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.7, 0.1), steel);
        leg.position.copy(board.position).addScaledVector(boardRight, side * 1.55).addScaledVector(normal, 0.08);
        leg.position.y = 0.85;
        leg.castShadow = false;
        scene.add(leg);
      }
    }

    // distant mountains
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x7896a0, roughness: 1, flatShading: true });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      const m = new THREE.Mesh(new THREE.ConeGeometry(8 + Math.random() * 7, 12 + Math.random() * 12, 5), mountainMat);
      m.position.set(Math.cos(a) * 58, 3, Math.sin(a) * 58);
      scene.add(m);
    }

    // trackside trees and stands
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2e2118, roughness: 1 });
    const leafMats = [0x2c6a3c, 0x245c36, 0x357447].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.92 }));
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const radius = 24 + (i % 4) * 2.2;
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.4, 6), trunkMat);
      trunk.position.y = 0.7;
      tree.add(trunk);
      const crownMat = leafMats[i % leafMats.length];
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.15 + (i % 3) * 0.24, 2.2, 8), crownMat);
      crown.position.y = 2.0; crown.castShadow = true; tree.add(crown);
      const crown2 = new THREE.Mesh(new THREE.ConeGeometry(0.86 + (i % 3) * 0.16, 2.0, 8), crownMat);
      crown2.position.y = 3.1; crown2.castShadow = true; tree.add(crown2);
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
        for (let k = 0; k < 14; k++) {
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 7, 5), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.4, 0.55), roughness: 0.8 }));
          head.position.set(-3.1 + k * 0.46, 0.65 + row * 0.45, row * 0.7 + 0.25);
          stand.add(head);
        }
      }
      stand.position.set(Math.cos(angle) * 32, 0, Math.sin(angle) * 32);
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
      wheels.forEach((w) => { w.rotation.x = kart.userData.wheelSpin as number; });
      (kart.userData.frontWheels as THREE.Group[]).forEach((w) => { w.rotation.y = (view?.steer ?? 0) * 0.35; });
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
          const desired = p.clone().addScaledVector(tan, -4.3 - Math.min(1.5, speed * 0.07)).add(new THREE.Vector3(0, 1.9 + Math.min(0.35, speed * 0.025), 0));
          camera.position.lerp(desired, 0.18);
          camera.fov += ((58 + Math.min(14, speed * 1.2)) - camera.fov) * 0.08;
          camera.updateProjectionMatrix();
          camera.lookAt(p.clone().addScaledVector(tan, 5).add(new THREE.Vector3(0, 0.95, 0)));
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