import * as dat from 'dat.gui';
const oboe = require("oboe")

import { getSurveys } from './api';


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
  let surveysVisibility = {}
  const surveysFolder = gui.addFolder('Surveys');

  const nodeCallback = (surveyName) => {
    surveysVisibility[surveyName] = false
  }
  const doneCallback = () => {
    surveysVisibility = Object.keys(surveysVisibility)
      .sort().reduce(
        (obj, key) => {
          obj[key] = surveysVisibility[key];
          return obj;
        },
        {}
      )
    // Add to menu
    Object.entries(surveysVisibility).forEach(([surveyName, state]) => {
      surveysFolder.add(surveysVisibility, surveyName)
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
