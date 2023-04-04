import * as dat from 'dat.gui';
const oboe = require("oboe")

import { getSurveys } from './api';
import { updateInstancedMesh } from './mesh'


const buildViewerGui = (gui) => {
  // Show visualizaton options
  const viewerSettings = {
    "Show Orbits": true,
    "Bloom": true
  }
  const viewerSettingsFolder = gui.addFolder('Viewer');
  viewerSettingsFolder.add(viewerSettings, "Show Orbits")
  viewerSettingsFolder.add(viewerSettings, "Bloom")
  viewerSettingsFolder.open()
  return viewerSettings
}

const buildBodiesGui = (gui) => {
  // Track visibility of bodies by type
  const bodyTypesVisibility = { "Stars": true, "Planets": true, "Asteroids": true }
  const bodyTypesFolder = gui.addFolder('Body Types');
  Object.entries(bodyTypesVisibility).forEach(([bodyType, state]) => {
    bodyTypesFolder.add(bodyTypesVisibility, bodyType)
  });
  bodyTypesFolder.open()
  return bodyTypesVisibility
}

const buildSurveysGui = (gui) => {
  // Track visibility of bodies by survey
  let surveysVisibility = {"All": true}
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
    controllers = Object.keys(surveysVisibility).map((surveyName) => {
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

export default () => {
  // Initialize Gui
  let gui = new dat.gui.GUI();
  let settings = {}
  settings.viewer = buildViewerGui(gui)
  settings.bodies = buildBodiesGui(gui)
  settings.surveys = buildSurveysGui(gui)
  return settings
}
