import canvasSketch from 'canvas-sketch';
import updateSpaceObjects from './simulation'
import SpaceObject from './spaceObject';

import * as THREE from 'three';
global.THREE = THREE;
require("three/examples/js/controls/OrbitControls");

import data from './objects.json'

const TIME_STEP_INTERVAL = 1.5
const DEFAULT_START_DATE = 0

// specific to canvas, not our own params
const settings = {
  animate: true,
  attributes: { antialias: true },
  context: 'webgl',
};

const Visualizer = {
  currentTime: 1,
  currentView: "view",
  currentSpaceObjects: ["spaceObject"]
}

const sketch = ({ context, fps }) => {

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

  const initializeSpaceObjects = () => {
    return data.map(object => {
      return new SpaceObject(
        object.name,
        object.positions,
        TIME_STEP_INTERVAL,
        object.size,
        object.group,
        DEFAULT_START_DATE
      )
    })
  }

  const addMeshes = (scene, spaceObjects) => {
    spaceObjects.forEach((spaceObject) => {
      scene.add(spaceObject.mesh)
    })
  }

  const renderer = initializeRenderer()
  const camera = initializeCamera()

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Load scene
  const scene = new THREE.Scene();

  // Load meshes and add them to scene
  const spaceObjects = initializeSpaceObjects()
  addMeshes(scene, spaceObjects)

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
      const state = {
        time: time % 1.5,
        visibleGroups: ["group1"]
      }

      updateSpaceObjects(spaceObjects, state)

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
