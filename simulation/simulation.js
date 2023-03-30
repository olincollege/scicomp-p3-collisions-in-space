// contains logic to go through scene objects and update their vertices 
export default function updateSpaceObjects(spaceObjects, state) {
    spaceObjects.forEach((spaceObject) => {
        // update positions
        spaceObject.updatePositionAtTime(state.time)

        // update visibility
        const isVisible = state.visibleGroups.includes(spaceObject.group)
        spaceObject.setVisibility(isVisible)
    })
}