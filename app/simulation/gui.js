import GUI from 'lil-gui';

import { getSurveys } from './api';
import { updateInstancedMesh } from './mesh'


const buildViewerGui = (gui) => {
  // Show visualizaton options
  const viewerSettings = {
    "Show Orbits": true,
    "Bloom": true,
    "Bloom Strength": 1.5,
  }
  const viewerSettingsFolder = gui.addFolder('Viewer');
  // viewerSettingsFolder.add(viewerSettings, "Show Orbits")
  viewerSettingsFolder.add(viewerSettings, "Bloom")
  viewerSettingsFolder.add(viewerSettings, "Bloom Strength", 0, 5)
  viewerSettingsFolder.open()
  return viewerSettings
}

const buildBodiesGui = (gui) => {
  // Track visibility of bodies by type
  const bodyTypesVisibility = { "Stars": true, "Solar System": true, "Asteroids": true }
  const bodyTypesFolder = gui.addFolder('Body Types');
  Object.entries(bodyTypesVisibility).forEach(([bodyType, state]) => {
    bodyTypesFolder.add(bodyTypesVisibility, bodyType)
  });
  bodyTypesFolder.open()
  return bodyTypesVisibility
}

const buildSurveysGui = (gui) => {
  // Track visibility of bodies by survey
  let surveysVisibility = { "All": true }
  let controllers = []
  const surveysFolder = gui.addFolder('Surveys');

  let allInProgress = false
  const callback = () => {
    // Callback for normal survey gui elements
    if (!allInProgress) {
      updateInstancedMesh(surveysVisibility)
    }
  }

  const allCallback = () => {
    // Callback for 'All' gui element
    let state = surveysVisibility['All']
    allInProgress = true
    controllers.forEach((controller) => {
      if (controller.property != 'All') {
        controller.setValue(state)
      }
    })
    allInProgress = false
    callback()
  }

  const nodeCallback = (data) => {
    Object.values(data.surveys).forEach((surveyName) => {
      surveysVisibility[surveyName] = true
    })
  }
  const doneCallback = () => {
    // Add to menu
    controllers = Object.keys(surveysVisibility)
      .sort()
      .map((surveyName) => {
        let controller = surveysFolder.add(surveysVisibility, surveyName)
        if (surveyName == 'All') {
          controller.onChange(allCallback)
        } else {
          controller.onChange(callback)
        }
        return controller
      });
    surveysFolder.open()
  }
  getSurveys(nodeCallback, doneCallback)

  return surveysVisibility
}

const buildDisplay = () => {
  let display = new GUI({ autoPlace: false, width: 300 });
  const element = document.createElement('div')
  element.appendChild(display.domElement)
  element.style.position = "absolute"
  element.style.top = "0"
  element.style.left = "20px"
  document.body.appendChild(element)

  let data = {
    "Name": "",
    "Number": "",
    "Provisional Designation": "",
    "Survey": "",
    "Discovery Time": ""
  }
  const metadataFolder = display.addFolder('Metadata');
  Object.keys(data).forEach((key) => {
    let controller = metadataFolder.add(data, key)
    controller.disable()
  })

  return display
}

export default () => {
  // Initialize Gui
  let gui = new GUI({ width: 300 });
  let settings = {}
  settings.viewer = buildViewerGui(gui)
  settings.bodies = buildBodiesGui(gui)
  settings.surveys = buildSurveysGui(gui)

  let display = buildDisplay()

  return [settings, display]
}
