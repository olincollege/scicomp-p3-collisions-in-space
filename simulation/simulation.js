// contains logic to go through scene objects and update their vertices 
export default function updateSpaceObjects(spaceObjects, state) {
    spaceObjects.forEach((spaceObject) => {
        spaceObject.updatePositionAtTime(state.time)
    })
}