const oboe = require("oboe")
import * as THREE from 'three';
import { degToRad } from "three/src/math/MathUtils"

import { streamAsteroids, getMetadata, getSurveys, getSurvey } from './api';

let initialized = false
let numAsteroids
let surveyMap
let objectMesh, orbitMesh
let meshes = {}
let matrixCache = {}

const initializeInstancedMesh = (scene) => {
  const initMesh = () => {
    let objectGeometry = new THREE.SphereGeometry(1000000000, 3, 3)
    let objectMaterial = new THREE.MeshPhysicalMaterial({
      color: 'grey',
      roughness: 1,
      flatShading: false,
    })
    meshes.asteroids = new THREE.InstancedMesh(objectGeometry, objectMaterial, numAsteroids)
    let orbitMaterial = new THREE.MeshPhysicalMaterial({
      color: 'blue',
      roughness: 1,
      flatShading: true,
    })
    const orbitGeometry = new THREE.TorusGeometry(1, .0001, 3, 64);
    meshes.orbits = new THREE.InstancedMesh(orbitGeometry, orbitMaterial)

    let neutralColor = new THREE.Color("grey")

    const dummyObject = new THREE.Object3D()
    const dummyOrbit = new THREE.Object3D()
    let i = 0
    let j = 0
  
    const nodeCallback = (data) => {
      const pos = data.pos
      dummyObject.position.set(pos.x, pos.y, pos.z)
      dummyObject.updateMatrix();

      let cacheMatrix = new THREE.Matrix4()
      cacheMatrix.copy(dummyObject.matrix)
      matrixCache[i] = cacheMatrix

      meshes.asteroids.setColorAt(i, neutralColor)
      meshes.asteroids.setMatrixAt(i++, dummyObject.matrix);

      // dummyOrbit.rotateY(data.peri) // not sure where this is supposed to go
      // dummyOrbit.rotateZ(degToRad(data.node))
      // dummyOrbit.rotateX(degToRad(data.i))
      // dummyOrbit.scale.set(
      //   data["semi-major"] / 2,
      //   data["semi-minor"] / 2,
      //   data["semi-major"]
      // )
      // dummyOrbit.updateMatrix();
      // meshes.orbits.setMatrixAt(j++, dummyOrbit.matrix);
    }
    const doneCallback = () => {
      scene.add(meshes.asteroids)
      scene.add(meshes.orbits)
      initialized = true
    }
    console.log("Building mesh...")
    streamAsteroids(nodeCallback, doneCallback)
  }
  
  const countNodeCallback = (data) => {
    numAsteroids = data.asteroids.n
  }
  const countDoneCallback = () => {
    initMesh()
  }
  getMetadata(countNodeCallback, countDoneCallback)

  const surveyNodeCallback = (data) => {
    const flipped = Object.entries(data.surveys).map(([key, value]) => {
      return [value, key]
    })
    surveyMap = Object.fromEntries(flipped)  // Name to ID mapping
  }
  getSurveys(surveyNodeCallback, () => {})

  return meshes
}

let currentUpdate = 0
const updateInstancedMesh = (surveyVisibility) => {
  if (!initialized || surveyMap == null) {
    return
  }

  currentUpdate += 1
  let updateId = currentUpdate

  const surveyIds = Object.entries(surveyVisibility)
    .filter(([survey, isVisible]) => {
      return isVisible && (surveyMap[survey] !== undefined)
    })
    .map(([survey, isVisible]) => {
      return surveyMap[survey]
    })

  const visibleAsteroids = new Set()
  let count = 0
  const target = surveyIds.length
  
  const updateMesh = () => {
    if (currentUpdate != updateId) {
      console.log("Aborting update, new update available.")
      return
    }
    console.log("Updating mesh...")
    const emptyMatrix = new THREE.Matrix4()
    for (let i = 0; i < numAsteroids; i++) {
      if (!visibleAsteroids.has(i + 1)) {
        meshes.asteroids.setMatrixAt(i, emptyMatrix);
      } else {
        meshes.asteroids.setMatrixAt(i, matrixCache[i])
      }
    }
    meshes.asteroids.instanceMatrix.needsUpdate = true
    console.log("Updated mesh!")
  }

  if (surveyIds.length == 0) {
    updateMesh()
    return
  }

  const nodeCallback = (data) => {
    data.asteroids.forEach((asteroidId) => {
      visibleAsteroids.add(asteroidId)
    })
  }
  const doneCallback = () => {
    count += 1
    if (count == target) {
      updateMesh()
    }
  }
  surveyIds.forEach((surveyId) => {
    getSurvey(surveyId, nodeCallback, doneCallback)
  })
}

export { initializeInstancedMesh, updateInstancedMesh }
