import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

THREE.ColorManagement.enabled = false;

const gui = new dat.GUI();

const canvas = document.querySelector('canvas.c');

const scene = new THREE.Scene();

// const floor = new THREE.Mesh(
//   new THREE.PlaneGeometry(10, 10),
//   new THREE.MeshStandardMaterial({
//     color: '#444444',
//     metalness: 0,
//     roughness: 0.5,
//   })
// );
// floor.receiveShadow = true;
// floor.rotation.x = -Math.PI * 0.5;
// scene.add(floor);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(4, 2, 4);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const clock = new THREE.Clock();
let previousTime = 0;

const gravity = 0.0005;
const sphereRadius = 0.01;
const dampingFactor = 1.1;

const spheres = [];

const addSpheres = () => {
  for (let i = 0; i < 100; i++) {
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xeae2b7 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = (Math.random() - 0.5) * 4;
    sphere.position.y = (Math.random() - 0.5) * 2 + sphereRadius;
    sphere.position.z = (Math.random() - 0.5) * 2;
    sphere.receiveShadow = true;
    scene.add(sphere);

    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.001,
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01
    );

    const initialHue = Math.random();

    spheres.push({ mesh: sphere, velocity: velocity, hue: initialHue });
  }
};

addSpheres();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  controls.update();

  spheres.forEach(({ mesh, velocity, hue }) => {
    velocity.y -= gravity;
    mesh.position.add(velocity);

    if (mesh.position.y < sphereRadius) {
      mesh.position.y = sphereRadius;
      velocity.y *= -dampingFactor;
    }

    hue += 0.9 * deltaTime;
    if (hue > 1) hue -= 1;
    const color = new THREE.Color().setHSL(hue, 1, 0.5);
    mesh.material.color = color;
  });

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
