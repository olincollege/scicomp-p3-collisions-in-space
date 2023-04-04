import canvasSketch from 'canvas-sketch';

const oboe = require("oboe")

import SpaceObject from './spaceObject';
import initializeGui from './gui';
import { initializeRaycaster } from './raycasting'
import { initializeInstancedMesh } from './mesh'

import * as THREE from 'three';

global.THREE = THREE;
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/shaders/ConvolutionShader");
require("three/examples/js/shaders/CopyShader");
require("three/examples/js/shaders/LuminosityHighPassShader");
require("three/examples/js/postprocessing/EffectComposer");
require("three/examples/js/postprocessing/RenderPass");
require("three/examples/js/postprocessing/ShaderPass");
require("three/examples/js/postprocessing/BloomPass");
require("three/examples/js/postprocessing/UnrealBloomPass");

let guiSettings = initializeGui()

// set camera render limits
const cameraMinRenderDepth = 1e10
const cameraMaxRenderDepth = 1e14

// specific to canvas, not our own params
const settings = {
  animate: true,
  attributes: { antialias: true },
  context: 'webgl',
};

// Main sketch function
const sketch = async ({ context, fps }) => {
  const initializeScene = () => {
    // Load scene
    const scene = new THREE.Scene();
    // Add some light
    scene.add(new THREE.AmbientLight('white', .4));
    const sun = new THREE.PointLight('white', .8);
    scene.add(sun);
    return scene
  }

  // Setup renderer
  const initializeRenderer = () => {
    const renderer = new THREE.WebGLRenderer({
      context: context,
    });
    // WebGL background color
    renderer.setClearColor('#000', 1);
    return renderer
  }

  // Configure camera to look at scene
  const initializeCamera = () => {
    const camera = new THREE.PerspectiveCamera(
      45, 1, cameraMinRenderDepth, cameraMaxRenderDepth
    );
    camera.position.z = 5000000000000;
    camera.rotation.y = Math.PI
    camera.lookAt(new THREE.Vector3())

    return camera
  }

  const camera = initializeCamera()

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  const scene = initializeScene()
  const renderer = initializeRenderer()

  // Set up renderer and render pass
  const renderScene = new THREE.RenderPass(scene, camera);

  // Set up bloom effect pass
  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight)
  );
  bloomPass.strength = 3;
  bloomPass.threshold = .01;
  bloomPass.radius = 1;

  // Combine everything with an effect composer
  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.setSize(window.innerWidth, window.innerHeight);

  const { raycaster, mouse } = initializeRaycaster()
  let { objectMesh, orbitMesh } = initializeInstancedMesh(scene)

  // Show or hide visibility based on body type and view settings
  const updateVisibility = () => {
    const isOrbitVisible = guiSettings.viewer['Show Orbits']
    try {
      orbitMesh.visible = isOrbitVisible
    } catch {}
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
      // Show/hide objects based on type selection and view settings
      updateVisibility()

      // // Check if hovering over any objects, if so highlight in a color
      // const highlightedObjectIds = checkForHighlightedObjects()
      // highlightObjectsByID(highlightedObjectIds)

      bloomPass.enabled = guiSettings.viewer.Bloom
      controls.update();
      composer.render();
    },
    // Dispose of WebGL context (optional)
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
