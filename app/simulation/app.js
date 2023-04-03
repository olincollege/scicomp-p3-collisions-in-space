import canvasSketch from 'canvas-sketch';

const oboe = require("oboe")

import SpaceObject from './spaceObject';

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

import * as dat from 'dat.gui';

const pathToSurveyJSON = './data/processed/survey_codes.json'
const pathToOrbitJSON = './data/processed/asteroids.json'

// Initialize Gui
var gui = new dat.gui.GUI();

// Show visualizaton options
const viewerSettings = {
  "Show orbits": true
}
const viewerSettingsFolder = gui.addFolder('Viewer');
viewerSettingsFolder.add(viewerSettings, "Show orbits")
viewerSettingsFolder.open()

// Track visibility of bodies by type
const bodyTypesVisibility = { "Stars": true, "Planets": true, "Asteroids": true }
const bodyTypesFolder = gui.addFolder('Body Types');

Object.entries(bodyTypesVisibility).forEach(([bodyType, state]) => {
  bodyTypesFolder.add(bodyTypesVisibility, bodyType)
});
bodyTypesFolder.open()

// Track visibility of bodies by survey
let surveysVisibility = {}
let prevSurveysVisibility = {}
const surveysFolder = gui.addFolder('Surveys');

// Fetch survey lists and show in gui
oboe({
  url: pathToSurveyJSON,
  headers: { "Access-Control-Allow-Headers": "*" }
})
  .node('!*.', function (surveyName) {
    surveysVisibility[surveyName] = false
  })
  .done(() => {
    // Sort survey list
    surveysVisibility = Object.keys(surveysVisibility)
      .sort().reduce(
        (obj, key) => {
          obj[key] = surveysVisibility[key];
          return obj;
        },
        {}
      );

    // Add to menu
    Object.entries(surveysVisibility).forEach(([surveyName, state]) => {
      surveysFolder.add(surveysVisibility, surveyName)
    });
    surveysFolder.open()
    console.log('Loaded survey list!')
  })
  .fail(() => {
    console.error('Failed to load survey list!')
  });

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
    const camera = new THREE.PerspectiveCamera(45, 1, cameraMinRenderDepth, cameraMaxRenderDepth);
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

  const loadObjectsBySurveys = () => {
    // Update list of visible surveys
    let visibleSurveys = []
    Object.entries(surveysVisibility).filter(([survey, isVisible]) => {
      if (isVisible) {
        visibleSurveys.push(survey)
      }
    });

    // Load objects
    oboe({
      url: pathToOrbitJSON,
      headers: { "Access-Control-Allow-Headers": "*" }
    })
      .node('!.*', function (data) {
        if (data != null) {
          if (visibleSurveys.includes(data.survey)) {
            const spaceObject = new SpaceObject(
              data, "Asteroids", 'grey'
            )
            if (typeof (spaceObjects[data.survey]) == "undefined") {
              spaceObjects[data.survey] = [spaceObject]
            } else {
              spaceObjects[data.survey].push(spaceObject)
            }
            scene.add(spaceObject.mesh)
          }
        }
      })
      .done(() => {
        console.log('Loaded requested space objects!')
      })
      .fail(() => {
        console.error('Failed to load space objects!')
      });

    // Unload objects
    Object.keys(spaceObjects).forEach(survey => {
      if (!visibleSurveys.includes(survey)) {
        spaceObjects[survey].forEach(spaceObject => {
          scene.remove(spaceObject.mesh)
        })
        delete spaceObjects[survey]
      }
    })
  }

  // Show or hide visibility based on body type and view settings
  const updateVisibility = () => {
    const isOrbitVisible = viewerSettings['Show orbits']

    Object.values(spaceObjects).forEach(spaceObjectsArray => {
      spaceObjectsArray.forEach((spaceObject) => {
        const isSpaceObjectVisible = bodyTypesVisibility[spaceObject.type]

        spaceObject.setVisibility(isSpaceObjectVisible)
        spaceObject.setOrbitVisibility(isOrbitVisible && isSpaceObjectVisible)
      })
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

      // Load current objects based on filter visibility
      if (JSON.stringify(surveysVisibility) !== JSON.stringify(prevSurveysVisibility)) {
        // need to do a more complex list of objects to unload and objects to load
        loadObjectsBySurveys()
        prevSurveysVisibility = JSON.parse(JSON.stringify(surveysVisibility))
      }

      // Show/hide objects based on type selection and view settings
      updateVisibility()

      // Check if hovering over any objects, if so highlight in a color
      const highlightedObjectIds = checkForHighlightedObjects()
      highlightObjectsByID(highlightedObjectIds)

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
