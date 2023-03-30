import canvasSketch from 'canvas-sketch';
import random from 'canvas-sketch-util/random';
import color from 'canvas-sketch-util/color';
import { mapRange, clamp } from 'canvas-sketch-util/math';

import importData from './importData'

import * as THREE from 'three';
global.THREE = THREE;
require("three/examples/js/controls/OrbitControls");

// specific to canvas, not our own params
const settings = {
  animate: true,
  attributes: { antialias: true },
  context: 'webgl',
  dimensions: [2048, 2048],
};


const initialize = () => {
  data = initializeData()
}


const Visualizer = {
  currentTime: 1,
  currentView: "view",
  currentSpaceObjects: ["spaceObject"]
}



const sketch = async ({ context, fps }) => {
  console.log(await importData())

  // Setup renderer
  const initializeRenderer = () => {
    const renderer = new THREE.WebGLRenderer({
      context
    });
    // WebGL background color
    renderer.setClearColor('#000', 1);

    return renderer;
  }

  // Setup a camera
  const initializeCamera = () => {
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    camera.position.set(2, 2, -4);
    camera.lookAt(new THREE.Vector3())

    return camera
  }

  // Define all meshes
  const initializeMeshes = () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshPhysicalMaterial({
        color: 'white',
        roughness: 0.75,
        flatShading: true
      })
    );

    return mesh
  }

  const renderer = initializeRenderer()
  const camera = initializeCamera()

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Load scene
  const scene = new THREE.Scene();

  // Load meshes and add to scene
  const meshes = initializeMeshes()
  scene.add(meshes);

  // Add some light
  scene.add(new THREE.AmbientLight('#59314f'));
  const light = new THREE.PointLight('#45caf7', 1, 15.5);
  light.position.set(2, 2, -4).multiplyScalar(1.5);
  scene.add(light);

  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // And render events here
    render({ time, deltaTime }) {
      // const state = [getGuiParams(), getCurrentTime()] // maybe there's a separate gui file...

      // updateObjects(meshes, state) // meshes would get passed into this
      meshes.rotation.y = time * (10 * Math.PI / 180); // above rep.aces this

      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of WebGL context (optional)
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
