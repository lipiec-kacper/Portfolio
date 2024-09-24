import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';

let renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
let cameraList = [];
let camera;
let currentCamera = 1;
let lastScrollPosition = 0;

let animationAction;

// Animation variables
let mixer; // Animation mixer
const clock = new THREE.Clock(); // Clock to track time

// Load the GLB model
const loadGLTFModel = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
      scene.add(gltf.scene);
      setupAnimations(gltf);
      const screen = scene.getObjectByName('BlackScreen');

      if (screen) {
        const video = document.createElement('video');
        video.src = '/public/models/vid.mp4'
        video.loop = true;
        video.muted = true;
        video.play();

        //Create a texture from the video
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.repeat.set(4, 6); // Increase these values to make the video smaller

        // Center the video texture by adjusting the offset
        videoTexture.offset.set(-0.52, -1.5);

        // Apply the video texture to the screen material
        screen.material = new THREE.MeshBasicMaterial({ map: videoTexture });

      }
      resolve();
    }, undefined, reject);
  });
};
function setupAnimations(gltf) {
  mixer = new THREE.AnimationMixer(gltf.scene);

  // Play all animations simultaneously
  if (gltf.animations.length > 0) {
    gltf.animations.forEach((clip, index) => {
      const animationAction = mixer.clipAction(clip);
      animationAction.setLoop(THREE.LoopOnce, 1); // Set to play once
      animationAction.clampWhenFinished = true; // Ensure it clamps to the last frame
      animationAction.play(); // Play the animation

      // Listen for the finished event to stop and keep the last position
      animationAction.onFinished = () => {
        animationAction.stop(); // Stop the animation but keep the last position
      };
    });
  }
}

// Retrieve list of all cameras
function retrieveListOfCameras() {
  scene.traverse((object) => {
    if (object.isCamera) {
      cameraList.push(object);
    }
  });
  camera = cameraList[1];
  camera.fov = 31;
  updateCameraAspect(camera);
  renderer.setAnimationLoop(animate);
}

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
    onUpdate: function () {
      camera.lookAt(-0.545640230178833, 0.1285281628370285, -0.0006271898746490479);
    },
  });
}

function smoothCameraTransitionDN() {
  gsap.to(camera.position, {
    x: 0.35830822587013245,
    y: 0.4298137128353119,
    z: 0.42748406529426575,
    duration: 2,
    onUpdate: function () {
      camera.lookAt(-0.545640230178833, 0.1285281628370285, -0.0006271898746490479);
    },
  });
}

let scrollThreshold = 10; // Adjust this value to control sensitivity

function switchCameraOnScroll() {
  const currentScrollPosition = window.scrollY;
  const scrollDifference = Math.abs(currentScrollPosition - lastScrollPosition);

  if (scrollDifference > scrollThreshold) {
    if (currentScrollPosition > lastScrollPosition) {
      if (currentCamera === 0) {
        currentCamera = 1;
        smoothCameraTransitionDN();
        updateCameraAspect(camera);
      }
    } else if (currentScrollPosition < lastScrollPosition) {
      if (currentCamera === 1 && currentScrollPosition <= 10) {
        currentCamera = 0;
        smoothCameraTransition(cameraList[0]);
        updateCameraAspect(camera);
      }
    }
    lastScrollPosition = currentScrollPosition; // Update last scroll position
  }
}

window.addEventListener('scroll', switchCameraOnScroll);

// Animate function
function animate() {
  // Update the mixer with the delta time
  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta); // Update animations
  }
  // Render the scene
  renderer.render(scene, camera);
}

// Initialize the scene and load the model
loadGLTFModel('/public/models/sceneAnim.gltf')
  .then(retrieveListOfCameras)
  .catch((error) => {
    console.error('Error loading GLTF model:', error);
  });

// Handle window resize
window.addEventListener('resize', () => {
  updateCameraAspect(camera);
  renderer.setSize(window.innerWidth, window.innerHeight);
});
