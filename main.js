import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
renderer.setAnimationLoop(function () {
  renderer.render(scene, camera);
});

// Geometries
const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshStandardMaterial({
  color: 0xc0def8,
});
const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({
  color: 0xffde2d,
});

// Mesh
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 5, 50);
scene.add(cube);

// Lights
const pointLigth = new THREE.PointLight(0xffffff);
pointLigth.position.set(5, 5, 10);
pointLigth.intensity = 111.5;

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLigth, ambientLight);
//

const lightHelper = new THREE.PointLightHelper(pointLigth);
const gridHelper2 = new THREE.GridHelper(200, 50);
scene.add(lightHelper, gridHelper2);

// Helpers
const controls = new OrbitControls(camera, renderer.domElement);

// Add Star

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Add Background
const spaceTexture = new THREE.TextureLoader().load("stars.jpg");
scene.background = spaceTexture;

// Add Model
const loader = new GLTFLoader();
loader.load(
  "/images/gallery.glb",
  function (gltf) {
    const model = gltf.scene;
    scene.add(model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log(error);
  }
);

// Animation
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += -0.01;
  cube.rotation.y += -0.01;
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.01;
  torus.rotation.z += 0.01;
  controls.update();
  renderer.render(scene, camera);
}

animate();

document.body.appendChild(VRButton.createButton(renderer));

renderer.xr.enabled = true;
