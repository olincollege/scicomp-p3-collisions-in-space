// contains logic to go through scene objects and update their vertices 
export default function updateSpaceObjects(spaceObjects, state) {
    spaceObjects.forEach((spaceObject) => {

        // update visibility
        const isVisible = state.visibleGroups.includes(spaceObject.group) && state.visibleTypes.includes(spaceObject.type)
        spaceObject.setVisibility(isVisible)
    })
}
