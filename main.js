import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
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


let storedHTML = null;
let storedHTML2 = null;

let mixer;
let played = false;
const clock = new THREE.Clock();

//Load the GLB model
const loadGLTFModel = (path) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(path, (gltf) => {
      scene.add(gltf.scene);
      setupAnimations(gltf);
      const screen = scene.getObjectByName('BlackScreen');

      if (screen) {
        const video = document.createElement('video');
        video.src = '/models/modified.mp4'
        video.loop = false;
        video.muted = true;

        //Create a texture from the video
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.repeat.set(4, 4); // Increase these values to make the video smaller

        // Center the video texture by adjusting the offset
        videoTexture.offset.set(-0.5, -1);


        video.currentTime = 0;
        video.pause();
        video.onloadeddata = () => {
          videoTexture.needsUpdate = true; // Ensure the texture is updated
          screen.material = new THREE.MeshBasicMaterial({ map: videoTexture });
        };

        // Store video and texture for later usage
        screen.userData.video = video;
        screen.userData.videoTexture = videoTexture;
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

//ZOOM
function smoothCameraTransition(targetCamera) {
  gsap.to(camera.position, {
    x: targetCamera.position.x,
    y: targetCamera.position.y,
    z: targetCamera.position.z,
    duration: 2,
    onUpdate: function () {
      camera.lookAt(-0.545640230178833, 0.1285281628370285, -0.0006271898746490479);
    },
    onComplete: function () {
      camera.position.set(targetCamera.position.x, targetCamera.position.y, targetCamera.position.z);
      const screen = scene.getObjectByName('BlackScreen');
      if (screen) {
        if (played === false) {
          const video = screen.userData.video;

          // Start playing the video
          video.play();

          // Stop the video at the last frame when it's finished
          video.onended = () => {
            video.currentTime = video.duration; // Set to the last frame
            video.pause();
            played = true;// Ensure the video doesn't restart
          };
        }

      }
      // Remove a specific HTML element (e.g., a div with ID 'oldDiv')
      const elementToRemove = document.getElementById('secondPart');
      const elementToRemove2 = document.getElementById('skills');
      if (elementToRemove) {
        storedHTML = elementToRemove.innerHTML;
        storedHTML2 = elementToRemove2.innerHTML;
        elementToRemove.remove();
        elementToRemove2.remove();
      }
    }
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
      camera.updateProjectionMatrix(); // Update the projection matrix to apply FOV changes
    },
    onComplete: function () {
      if (storedHTML) {
        camera.position.set(0.35830822587013245, 0.4298137128353119, 0.42748406529426575);
        const newDiv = document.createElement('div');
        newDiv.id = 'secondPart'; // Set the same ID if needed
        newDiv.innerHTML = storedHTML; // Use the stored HTML content
        document.body.appendChild(newDiv); // Append the new div to the body
        storedHTML = null;

        const newDiv2 = document.createElement('div');
        newDiv2.id = 'skills'; // Set the same ID if needed
        newDiv2.innerHTML = storedHTML2; // Use the stored HTML content
        document.body.appendChild(newDiv2); // Append the new div to the body
        storedHTML2 = null;

        const otherDiv = document.getElementById('mn');
        const otherDiv1 = document.getElementById('secondPart');
        const otherDiv2 = document.getElementById('skills');

        if (otherDiv && otherDiv1) {
          otherDiv.style.background = 'linear-gradient(to right, rgb(38, 28, 30), rgb(55, 36, 39) 40%, rgb(39, 31, 39) 75%, rgb(30, 26, 32))'; // Set the background gradient
          otherDiv1.style.backgroundImage = 'linear-gradient(to right, rgb(38, 28, 30) , rgb(55, 36, 39) 40%, rgb(39, 31, 39) 75%, rgb(30, 26, 32)), linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1))';
          otherDiv2.style.backgroundImage = 'radial-gradient(circle at center bottom, rgb(71,25,54) 4%, rgb(0, 0, 0) 39%)';
        }
      }
    }
  });

  // New GSAP animation for the FOV change
  gsap.to(camera, {
    fov: 31, // Target FOV value (change to your desired final FOV)
    duration: 2,
    onUpdate: function () {
      camera.updateProjectionMatrix(); // Ensure the FOV change is applied
    }
  });
}

let scrollThreshold = 10; // Adjust this value to control sensitivity

function switchCameraOnScroll() {
  const currentScrollPosition = window.scrollY;
  const scrollDifference = Math.abs(currentScrollPosition - lastScrollPosition);

  console.log(cameraList[1].position.x);
  console.log(cameraList[1].position.y);
  console.log(cameraList[1].position.z);


  if (scrollDifference > scrollThreshold) {
    if (currentScrollPosition > lastScrollPosition) {
      if (currentCamera === 0) {
        currentCamera = 1;
        smoothCameraTransitionDN(cameraList[1]);
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


window.addEventListener('scroll', switchCameraOnScroll);

// Initialize the scene and load the model
loadGLTFModel('/models/sceneRB.gltf')
  .then(retrieveListOfCameras)
  .catch((error) => {
    console.error('Error loading GLTF model:', error);
  });

// Handle window resize
// window.addEventListener('resize', () => {
//   updateCameraAspect(camera);
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });
//


