import canvasSketch from 'canvas-sketch';

const oboe = require("oboe")

import SpaceObject from './spaceObject';
import buildGui from './gui';
import { streamAsteroids, getMetadata } from './api';

import * as THREE from 'three';
import { degToRad } from "three/src/math/MathUtils"

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

const apiURL = 'http://127.0.0.1:5000/api'
const metadataEndpoint = apiURL + '/meta'
const asteroidsEndpoint = apiURL + '/asteroids'
const surveysEndpoint = apiURL + '/surveys'

let guiSettings = buildGui()
let prevSurveysVisibility = {}

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
  // Setup renderer
  const initializeRenderer = () => {
    const renderer = new THREE.WebGLRenderer({
      context: context,
    });
    // WebGL background color
    renderer.setClearColor('#000', 1);

    return renderer;
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

  // Setup a camera
  const camera = initializeCamera()

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup raycaster and cursor
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(1, 1);

  // Load scene
  const scene = new THREE.Scene();

  // Add some light
  scene.add(new THREE.AmbientLight('white', .4));
  const sun = new THREE.PointLight('white', .8);
  scene.add(sun);

  // Load meshes and add them to scene
  let spaceObjects = {}

  // Set up renderer and render pass
  const renderer = initializeRenderer()
  const renderScene = new THREE.RenderPass(scene, camera);

  // Set up bloom effect pass
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight));
  bloomPass.strength = 3;
  bloomPass.threshold = .01;
  bloomPass.radius = 1;

  // Combine everything with an effect composer
  const composer = new THREE.EffectComposer(renderer);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Callback for mouse movement
  const onMouseMove = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  // Setup event listener for mouse movement
  window.addEventListener("mousemove", onMouseMove);

  const checkForHighlightedObjects = () => {
    raycaster.setFromCamera(mouse, camera);

    // Search for intersections between mouse cursor and objects
    const highlightedObjectIds = []
    Object.values(spaceObjects).forEach(spaceObjectsArray => {
      spaceObjectsArray.forEach((spaceObject) => {
        const intersection = raycaster.intersectObject(spaceObject.objectMesh);
        if (intersection.length > 0) {
          highlightedObjectIds.push(intersection[0].object.uuid)
        }
      })
    })

    return highlightedObjectIds
  }

  // Highlights objects based on uuid
  const highlightObjectsByID = (uuid) => {
    Object.values(spaceObjects).forEach(spaceObjectsArray => {
      spaceObjectsArray.forEach(spaceObject => {
        const isHighlighted = (spaceObject.objectMesh.uuid == uuid)
        spaceObject.setHighlighted(isHighlighted)
      })
    })
  }

  let objectMesh, orbitMesh
  const buildInstancedMesh = () => {
    const initMesh = (count) => {
      let objectGeometry = new THREE.SphereGeometry(1000000000, 3, 3)
      let objectMaterial = new THREE.MeshPhysicalMaterial({
        color: 'grey',
        roughness: 1,
        flatShading: false,
      })
      objectMesh = new THREE.InstancedMesh(objectGeometry, objectMaterial, count)
      let orbitMaterial = new THREE.MeshPhysicalMaterial({
        color: 'blue',
        roughness: 1,
        flatShading: true,
      })
      const orbitGeometry = new THREE.TorusGeometry(1, .0001, 3, 64);
      orbitMesh = new THREE.InstancedMesh(orbitGeometry, orbitMaterial, count)

      const dummyObject = new THREE.Object3D()
      const dummyOrbit = new THREE.Object3D()
      let i = 0
    
      const nodeCallback = (data) => {
        const pos = data.pos
        dummyObject.position.set(pos.x, pos.y, pos.z)
        dummyObject.updateMatrix();
        objectMesh.setMatrixAt(i++, dummyObject.matrix);

        dummyOrbit.rotateY(data.peri) // not sure where this is supposed to go
        dummyOrbit.rotateZ(degToRad(data.node))
        dummyOrbit.rotateX(degToRad(data.i))
        dummyOrbit.scale.set(
          data["semi-major"] / 2,
          data["semi-minor"] / 2,
          data["semi-major"]
        )
        dummyOrbit.updateMatrix();
        orbitMesh.setMatrixAt(i++, dummyOrbit.matrix);
      }
      const doneCallback = () => {
        scene.add(objectMesh)
        scene.add(orbitMesh)
      }
      console.log("Building mesh...")
      streamAsteroids(nodeCallback, doneCallback)
    }
    
    let count = 0
    const nodeCallback = (data) => {
        count = data.asteroids.n
    }
    const doneCallback = () => {
      initMesh(count)
    }
    getMetadata(nodeCallback, doneCallback)
  }

  // Show or hide visibility based on body type and view settings
  const updateVisibility = () => {
    const isOrbitVisible = guiSettings.viewer['Show Orbits']
    try {
      orbitMesh.visible = isOrbitVisible
    } catch { }
  }

  buildInstancedMesh()

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

      // Load current objects based on filter visibility
      // if (JSON.stringify(surveysVisibility) !== JSON.stringify(prevSurveysVisibility)) {
      //   // need to do a more complex list of objects to unload and objects to load
      //   loadObjectsBySurveys()
      //   prevSurveysVisibility = JSON.parse(JSON.stringify(surveysVisibility))
      // }

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
