import * as THREE from 'three';

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

let lastHover
let hoverColor = new THREE.Color("red")
let neutralColor = new THREE.Color("grey")
const doHover = (raycaster, mouse, camera, meshes) => {
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
    if (lastHover !== undefined) {
      meshes.asteroids.setColorAt(lastHover, neutralColor)
    }
    lastHover = instanceId
    meshes.asteroids.instanceColor.needsUpdate = true
  }
}

export { initializeRaycaster, doHover }
