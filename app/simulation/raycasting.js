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

const checkForHighlightedObjects = (raycaster, mouse, camera) => {
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

export { initializeRaycaster, checkForHighlightedObjects, highlightObjectsByID }
