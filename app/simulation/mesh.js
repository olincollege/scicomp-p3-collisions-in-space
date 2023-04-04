const oboe = require("oboe")
import * as THREE from 'three';

import { streamAsteroids, getMetadata } from './api';

const initializeInstancedMesh = () => {
  let objectMesh, orbitMesh
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
    let j = 0
  
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
      orbitMesh.setMatrixAt(j++, dummyOrbit.matrix);
    }
    const doneCallback = () => {
      scene.add(objectMesh)
      scene.add(orbitMesh)
    }
    console.log("Building mesh...")
    streamAsteroids(nodeCallback, doneCallback)
  }
  
  let count;
  const nodeCallback = (data) => {
      count = data.asteroids.n
  }
  const doneCallback = () => {
    initMesh(count)
  }
  getMetadata(nodeCallback, doneCallback)

  return { objectMesh, orbitMesh }
}

const updateInstancedMesh = (surveyVisibility) => {
  const surveys = Object.entries(surveyVisibility)
    .filter(([survey, isVisible]) => {
      return isVisible
    })
    .map(([survey, isVisible]) => {
      return survey
    })
  console.log(surveys)
}

export { initializeInstancedMesh, updateInstancedMesh }
