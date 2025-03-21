import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { XRControllerModelFactory } from "https://cdn.jsdelivr.net/npm/three@0.119.1/examples/jsm/webxr/XRControllerModelFactory.min.js";
import spaceTexture from "./fireplace.jpg";
import gokuTexture from "./images/goku.jpeg";

const texture = new THREE.TextureLoader().load(spaceTexture);

const gallery = "./images/gallery.glb";

console.assert(
  gallery.startsWith("http://") ||
    gallery.startsWith("https://") ||
    gallery.startsWith("./") ||
    gallery.startsWith("../"),
  "gallery asset URL must be absolute (http://, https://, ./, or ../)"
);

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
cube.position.set(0, 5, -50);
scene.add(cube);

// Lights
const pointLigth = new THREE.PointLight(0xffffff);
pointLigth.position.set(5, 5, 10);
pointLigth.intensity = 111.5;

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.intensity = 23;
scene.add(pointLigth, ambientLight);
//

const lightHelper = new THREE.PointLightHelper(pointLigth);
const gridHelper2 = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper2);

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

// const spaceTexture = new THREE.TextureLoader().load("stars.jpg");
scene.background = texture;

scene.background.mapping = THREE.EquirectangularReflectionMapping; // fix background in VR

// Add Model
const loader = new GLTFLoader();
loader.load(
  gallery,
  function (gltf) {
    const model = gltf.scene;
    // scene.add(model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log(error);
  }
);

// Avatar

const gokuBox = new THREE.TextureLoader().load(gokuTexture);
const goku = new THREE.Mesh(
  new THREE.BoxGeometry(15, 29, 15),
  new THREE.MeshBasicMaterial({ map: gokuBox })
);
goku.position.set(10, 0, -5);
scene.add(goku);
// Animation

// Create XR controllers
const controller1 = renderer.xr.getController(0);
controller1.addEventListener("selectstart", onSelectStart);
controller1.addEventListener("selectend", onSelectEnd);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
controller2.addEventListener("selectstart", onSelectStart);
controller2.addEventListener("selectend", onSelectEnd);
scene.add(controller2);

// Add controller models
const controller1Model =
  XRControllerModelFactory.createControllerModel(controller1);
const controller2Model =
  XRControllerModelFactory.createControllerModel(controller2);

controller1.add(controller1Model);
controller2.add(controller2Model);

// Create hands
const hand1 = new XRHandController(controller1);
const hand2 = new XRHandController(controller2);

// Add hand models
const hand1Model = XRHandModelFactory.createHandModel(hand1);
const hand2Model = XRHandModelFactory.createHandModel(hand2);

scene.add(hand1Model);
scene.add(hand2Model);

document.body.appendChild(VRButton.createButton(renderer));

function onSelectStart(event) {
  const controller = event.target;

  const intersections = getIntersections(controller);

  if (intersections.length > 0) {
    const object = intersections[0].object;
    // Handle selection logic
  }
}

function onSelectEnd(event) {
  // Handle selection end logic
}

function getIntersections(controller) {
  const tempMatrix = new THREE.Matrix4();
  const matrixWorld = controller.matrixWorld;
  const raycaster = new THREE.Raycaster();

  raycaster.ray.origin.setFromMatrixPosition(matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

  // Perform intersection checks and return the results
  // Modify as per your specific needs

  return raycaster.intersectObjects(scene.children, true);
}

// ... (Your existing code)

// Update the animate function
function animate() {
  renderer.setAnimationLoop(function (frame) {
    cube.rotation.x += -0.01;
    cube.rotation.y += -0.01;
    torus.rotation.x += 0.01;
    torus.rotation.y += 0.01;
    torus.rotation.z += 0.01;
    goku.rotation.y += 0.01;

    // Update XR controllers
    hand1.update(frame);
    hand2.update(frame);

    controls.update();
    renderer.render(scene, camera);
  });
}

// Call animate directly instead of within setAnimationLoop
animate();

cube.getWorldPosition(camera.position);
animate();

// ... (Your existing code)

document.body.appendChild(VRButton.createButton(renderer));

// Ensure VR Resize
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Enable XR
renderer.xr.enabled = true;
