import * as THREE from 'three'
import { LoadGLTFByPath } from './Helpers/ModelHelper.js'
import { gsap } from 'gsap';


let renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'), antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();

let cameraList = [];
let camera;
let currentCamera = 1;
let lastScrollPosition = 0;


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
  scene.traverse(function (object) {
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
  camera.fov = 22;
  updateCameraAspect(targetCamera);

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
  camera.fov = 31;

  //const modelCenter = getModelCenter(scene);
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

  // Check if the scroll distance exceeds the threshold
  const scrollDifference = Math.abs(currentScrollPosition - lastScrollPosition);

  if (scrollDifference > scrollThreshold) {
    //Scrolling down
    if (currentScrollPosition > lastScrollPosition) {
      if (currentCamera === 0) {
        currentCamera = 1;
        smoothCameraTransitionDN();
        updateCameraAspect(camera);
      }
    }

    //Scrolling up
    if (currentScrollPosition < lastScrollPosition) {
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

function animate() {
  renderer.render(scene, camera);
};


//Camera 0 :
//camera x:0.10277917981147766
//camera y:0.30765146017074585
//camera z:0
//
//Camera 1:
//camera x:0.35830822587013245
//camera y:0.4298137128353119
//camera z:0.42748406529426575
