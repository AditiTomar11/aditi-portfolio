import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RotateCcw, Shuffle, MoveUpRight } from 'lucide-react';
import Modal from './Modal.jsx';

export default function Playground({ onClose, motion }) {
  const mount = useRef(null),
    controlsRef = useRef(null),
    groupRef = useRef(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const host = mount.current;
    let renderer,
      frame = 0,
      disposed = false;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
    camera.position.set(0, 1.3, 8.4);
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor('#f7f6f0', 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    host.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Interactive 3D shapes. Drag to orbit, or use the arrow keys.',
    );
    renderer.domElement.tabIndex = 0;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.7;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8b6c80, 2.5));
    const main = new THREE.DirectionalLight(0xfff3dc, 5);
    main.position.set(-3, 6, 5);
    main.castShadow = true;
    main.shadow.mapSize.set(1024, 1024);
    main.shadow.camera.left = -5;
    main.shadow.camera.right = 5;
    main.shadow.camera.top = 5;
    main.shadow.camera.bottom = -5;
    main.shadow.bias = -0.001;
    scene.add(main);
    const fill = new THREE.DirectionalLight(0xffffff, 2.5);
    fill.position.set(5, 2, -2);
    scene.add(fill);
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;
    const material = (color) =>
      new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.1,
        roughness: 0.23,
        clearcoat: 0.6,
        clearcoatRoughness: 0.2,
      });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.37, 48, 120), material('#ee7fa8'));
    torus.position.set(-0.28, 0.42, 0);
    torus.rotation.set(-0.35, 0.28, -0.55);
    torus.castShadow = true;
    group.add(torus);
    const box = new THREE.Mesh(
      new RoundedBoxGeometry(1.62, 1.43, 1.47, 5, 0.22),
      material('#ff8438'),
    );
    box.position.set(0.27, -1.03, 0.1);
    box.rotation.set(0.12, 0.48, -0.12);
    box.castShadow = true;
    group.add(box);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.66, 48, 48), material('#cee65e'));
    ball.position.set(1, 1.12, 0.3);
    ball.castShadow = true;
    group.add(ball);
    const starShape = new THREE.Shape();
    for (let i = 0; i < 8; i++) {
      const radius = i % 2 ? 0.23 : 0.7,
        angle = (i * Math.PI) / 4 + Math.PI / 2;
      const x = Math.cos(angle) * radius,
        y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();
    const star = new THREE.Mesh(
      new THREE.ExtrudeGeometry(starShape, {
        depth: 0.15,
        bevelEnabled: true,
        bevelSegments: 6,
        steps: 1,
        bevelSize: 0.16,
        bevelThickness: 0.16,
      }),
      material('#bda0ee'),
    );
    star.position.set(-1.55, -0.83, 0.6);
    star.rotation.set(0.05, -0.35, 0.25);
    star.castShadow = true;
    group.add(star);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.ShadowMaterial({ opacity: 0.1 }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -2.18;
    plane.receiveShadow = true;
    scene.add(plane);
    const size = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      renderer.setSize(host.clientWidth, host.clientHeight);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(size);
    observer.observe(host);
    size();
    const key = (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      group.rotation.y += e.key === 'ArrowRight' ? 0.15 : e.key === 'ArrowLeft' ? -0.15 : 0;
      group.rotation.x += e.key === 'ArrowDown' ? 0.1 : e.key === 'ArrowUp' ? -0.1 : 0;
    };
    renderer.domElement.addEventListener('keydown', key);
    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      const time = clock.getElapsedTime();
      if (motion) {
        group.position.y = Math.sin(time * 0.7) * 0.09;
        ball.position.y = 1.12 + Math.sin(time * 1.2) * 0.08;
        star.rotation.z = 0.25 + Math.sin(time) * 0.1;
      }
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    setReady(true);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('keydown', key);
      scene.traverse((obj) => {
        obj.geometry?.dispose();
        if (obj.material)
          (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((mat) =>
            mat.dispose(),
          );
      });
      renderer.dispose();
      renderer.domElement.remove();
      controlsRef.current = null;
      groupRef.current = null;
    };
  }, [motion]);
  return (
    <Modal title="A little creative playground" onClose={onClose} className="playground-modal">
      <div className="playground-header">
        <span className="eyebrow">JUST FOR THE JOY OF IT</span>
        <h2>
          A little creative <em>playground.</em>
        </h2>
        <p>Good ideas start with play. Give these shapes a spin.</p>
      </div>
      <div className="playground-stage" ref={mount}>
        {(!ready || failed) && (
          <img src="/images/creative-sculpture.webp" alt="Pink, lime, orange and lilac 3D shapes" />
        )}
      </div>
      <div className="playground-controls">
        <span>
          <MoveUpRight size={15} />{' '}
          {failed
            ? 'WebGL isn’t available. Enjoy the sculptural artwork instead.'
            : 'Drag to orbit · Arrow keys work too'}
        </span>
        <div>
          <button
            className="button button-outline button-small"
            disabled={failed || !ready}
            onClick={() => {
              controlsRef.current?.reset();
              if (groupRef.current) groupRef.current.rotation.set(0, 0, 0);
            }}
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            className="button button-dark button-small"
            disabled={failed || !ready}
            onClick={() => {
              if (groupRef.current)
                groupRef.current.rotation.set(
                  (Math.random() - 0.5) * 0.35,
                  Math.random() * Math.PI * 2,
                  (Math.random() - 0.5) * 0.2,
                );
            }}
          >
            <Shuffle size={15} /> Remix
          </button>
        </div>
      </div>
    </Modal>
  );
}
