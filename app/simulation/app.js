import canvasSketch from 'canvas-sketch';

import initializeGui from './gui';
import { initializeRaycaster, doHover } from './raycasting'
import { initializeInstancedMesh } from './mesh'

import * as THREE from 'three';

global.THREE = THREE;
require("three/examples/js/controls/OrbitControls");
require("three/examples/js/shaders/ConvolutionShader");
require("three/examples/js/shaders/CopyShader");
require("three/examples/js/shaders/LuminosityHighPassShader");
require("three/examples/js/shaders/ToneMapShader");
require("three/examples/js/shaders/LuminosityShader");
require("three/examples/js/postprocessing/EffectComposer");
require("three/examples/js/postprocessing/RenderPass");
require("three/examples/js/postprocessing/ShaderPass");
require("three/examples/js/postprocessing/BloomPass");
require("three/examples/js/postprocessing/UnrealBloomPass");
require("three/examples/js/postprocessing/AdaptiveToneMappingPass");

let [guiSettings, display] = initializeGui()

// set camera render limits
const cameraMinRenderDepth = 5e9
const cameraMaxRenderDepth = 1e13

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
    scene.add(new THREE.AmbientLight('#968cff', .5));
    const sunLight = new THREE.PointLight('#ffefc9', 1.5);
    scene.add(sunLight);

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
  controls.maxDistance = 3000000000000

  const scene = initializeScene()
  const renderer = initializeRenderer()

  // Set up renderer and render pass
  const renderScene = new THREE.RenderPass(scene, camera);

  // Set up bloom effect pass
  const bloomPass = new THREE.UnrealBloomPass(window.innerWidth * 2, window.innerHeight * 2);
  bloomPass.strength = 1.5;
  bloomPass.threshold = .01;
  bloomPass.radius = 1;

  const adaptiveToneMappingPass = new THREE.AdaptiveToneMappingPass(true, 256);
  adaptiveToneMappingPass.setMiddleGrey(8);
  adaptiveToneMappingPass.setMaxLuminance(10000);

  // Combine everything with an effect composer
  const composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth * 2, window.innerHeight * 2);
  composer.antialias = true;
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(adaptiveToneMappingPass);

  // Add skybox mesh
  const skyGeometry = new THREE.SphereGeometry(6000000000000, 64, 64);
  skyGeometry.scale(- 1, 1, 1); // invert so faces point inwards
  const skyTexture = new THREE.TextureLoader().load('./simulation/textures/8k_stars.jpeg');
  const skyMaterial = new THREE.MeshBasicMaterial({ map: skyTexture });
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(skyMesh);

  // Add solar system meshes
  const sunGeometry = new THREE.SphereGeometry(10000000000, 64, 64);
  let sunMaterial = new THREE.MeshBasicMaterial({
    color: '#ffef78'
  })
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
  scene.add(sunMesh);

  // Add asteroid meshes
  const { raycaster, mouse } = initializeRaycaster()
  let meshes = initializeInstancedMesh(scene)

  // Show or hide visibility based on body type and view settings
  const updateVisibility = () => {
    try {
      meshes.orbits.visible = guiSettings.viewer['Show Orbits']
    } catch { }

    try {
      meshes.asteroids.visible = guiSettings.bodies['Asteroids']
      skyMesh.visible = guiSettings.bodies['Stars']
      sunMesh.visible = guiSettings.bodies['Solar System']
    } catch { }
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
      updateVisibility()
      doHover(raycaster, mouse, camera, meshes, display)
      bloomPass.enabled = guiSettings.viewer['Bloom']
      bloomPass.strength = guiSettings.viewer['Bloom Strength']
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
