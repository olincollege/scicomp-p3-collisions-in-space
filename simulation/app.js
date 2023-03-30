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
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
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
      scene.add(spaceObject.objectMesh)
      scene.add(spaceObject.orbitMesh)
    })
  }

  const renderer = initializeRenderer()
  const camera = initializeCamera()

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup raycaster and cursor
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(1, 1);

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

  // Callback for mouse movement
  const onMouseMove = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  // Setup event listener for mouse movement
  window.addEventListener("mousemove", onMouseMove);

  // Highlights objects based on uuid
  const setHighlightedObjects = (uuid) => {
    spaceObjects.forEach(spaceObject => {
      const isHighlighted = (spaceObject.objectMesh.uuid == uuid)
      spaceObject.setHighlighted(isHighlighted)
    })
  }

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
      raycaster.setFromCamera(mouse, camera);

      // Search for intersections between mouse cursor and objects
      const highlightedObjectIds = []
      spaceObjects.forEach((spaceObject) => {
        const intersection = raycaster.intersectObject(spaceObject.objectMesh);
        if (intersection.length > 0) {
          highlightedObjectIds.push(intersection[0].object.uuid)
        }
      })
      // If found, highlight in a color
      setHighlightedObjects(highlightedObjectIds)

      // const state = [getGuiParams(), getCurrentTime()] // maybe there's a separate gui file...
      const state = {
        time: time % 1.5,
        visibleGroups: ["planets", "asteroids"]
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
