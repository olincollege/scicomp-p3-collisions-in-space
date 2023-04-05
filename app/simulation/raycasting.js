import * as THREE from 'three';

import { getAsteroid } from './api';

const initializeRaycaster = () => {
  // Setup raycaster and cursor
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(1, 1);
  // Callback for mouse movement
  const onMouseMove = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
  }

  // Setup event listener for mouse movement
  window.addEventListener("mousemove", onMouseMove);

  return { raycaster, mouse }
}

let currentId = 0
const updateDisplay = (asteroidId, display) => {
  currentId += 1
  let id = currentId
  const nodeCallback = (asteroid) => {
    if (id != currentId) {
      return
    }
    let date = new Date(asteroid.time.year, asteroid.time.month, asteroid.time.day)
    let data = {
      "Name": asteroid.name,
      "Number": asteroid.number,
      "Provisional Designation": asteroid.provisional,
      "Survey": asteroid.survey,
      "Discovery Time": date.toString()
    }
    display.folders[0].controllers.forEach((controller) => {
      controller.setValue(data[controller.property])
    })
  }
  getAsteroid(asteroidId + 1, nodeCallback, () => {})
}

let lastHover
let hoverColor = new THREE.Color("red")
let neutralColor = new THREE.Color("grey")
const doHover = (raycaster, mouse, camera, meshes, display) => {
  if (meshes.asteroids === undefined) {
    return
  }

  raycaster.setFromCamera(mouse, camera);
  const intersection = raycaster.intersectObject(meshes.asteroids)
  if (intersection.length > 0) {
    const instanceId = intersection[0].instanceId
    if (instanceId == lastHover) {
      return
    }
    meshes.asteroids.setColorAt(instanceId, hoverColor)
    updateDisplay(instanceId, display)
    if (lastHover !== undefined) {
      meshes.asteroids.setColorAt(lastHover, neutralColor)
    }
    lastHover = instanceId
    meshes.asteroids.instanceColor.needsUpdate = true
  }
}


export { initializeRaycaster, doHover }
