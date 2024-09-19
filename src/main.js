import * as THREE from 'three'
import { LoadGLTFByPath } from './Helpers/ModelHelper.js'
import { gsap } from 'gsap';

//Renderer does the job of rendering the graphics

let renderer = new THREE.WebGLRenderer({

  //Defines the canvas component in the DOM that will be used
  canvas: document.querySelector('#background'), antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

//set up the renderer with the default settings for threejs.org/editor
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available. 
renderer.outputColorSpace = THREE.SRGBColorSpace

const scene = new THREE.Scene();

let cameraList = [];
let currentCameraIndex = 0;
let camera;

let lastScrollPosition = window.scrollY; //Store the last scroll positon 
const switchThreshold = 5; //prevent the camera from switching too frequently with small scrolls


//Load the GLTF model 

LoadGLTFByPath(scene)
  .then(() => {
    retrieveListOfCameras(scene);
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
  });

//retrieve list of all cameras
function retrieveListOfCameras(scene) {
  // Get a list of all cameras in the scene
  scene.traverse(function (object) {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });

  //Set the camera to the first value in the list of cameras
  camera = cameraList[currentCameraIndex];
  updateCameraAspect(camera);

  // Start the animation loop after the model and cameras are loaded
  animate();
}

// Set the camera aspect ratio to match the browser window dimensions
function updateCameraAspect(camera) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
function smoothCameraTransition(targetCamera) {
  gsap.to(camera.position, {
    x: targetCamera.position.x,
    y: targetCamera.position.y,
    z: targetCamera.position.z,
    duration: 2,
    ease: 'power3.inout',
  });

  if (camera.controls) {
    gsap.to(camera.controls.target, {
      x: targetCamera.controls.target.x || 0,
      y: targetCamera.controls.target.y || 0,
      z: targetCamera.controls.target.z || 0,
      duration: 2,
      ease: 'power3.inout',
    });
  }
}

// Switch camera based on scroll direction
function switchCameraOnScroll() {
  const currentScrollPosition = window.scrollY;
  const scrollDelta = currentScrollPosition - lastScrollPosition;

  if (scrollDelta > switchThreshold && currentScrollPosition > lastScrollPosition) {
    // Scrolling down, switch to next camera
    if (currentCameraIndex < cameraList.length - 1) {
      currentCameraIndex++;
      smoothCameraTransition(cameraList[currentCameraIndex]);
      camera = cameraList[currentCameraIndex];
      updateCameraAspect(camera);
      console.log('Switched to camera:', currentCameraIndex, '(Scrolling down)');
    }
  } else if (scrollDelta < -switchThreshold && currentScrollPosition < lastScrollPosition) {
    // Scrolling up, switch to previous camera
    if (currentCameraIndex > 0) {
      currentCameraIndex--;
      smoothCameraTransition(cameraList[currentCameraIndex]);
      camera = cameraList[currentCameraIndex];
      updateCameraAspect(camera);
      console.log('Switched to camera:', currentCameraIndex, '(Scrolling up)');
    }
  }

  lastScrollPosition = currentScrollPosition;
}

// Add scroll listener for switching cameras
window.addEventListener('scroll', switchCameraOnScroll);

//A method to be run each time a frame is generated
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
};

