import * as THREE from 'three'
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const scenePath = '/public/models/scene.gltf'

export const LoadGLTFByPath = (scene) => {
  return new Promise((resolve, reject) => {
    //Create a loader 
    const loader = new GLTFLoader();

    //Load the GLTFLoader file 
    loader.load(scenePath, (gltf) => {
      const laptop = gltf.scene;
      const screen = laptop.getObjectByName('BlackScreen');
      scene.add(laptop);

      if (screen) {
        const video = document.createElement('video');
        video.src = '/public/models/vid.mp4'
        video.loop = true;
        video.muted = true;
        video.play();

        //Create a texture from the video
        const videoTexture = new THREE.VideoTexture(video);

        // Apply the video texture to the screen material
        screen.material = new THREE.MeshBasicMaterial({ map: videoTexture });

      }

      //Add the laptop model to the scene
      scene.add(laptop);

      resolve();
    }, undefined, (error) => {
      reject(error);
    });
  });
};
