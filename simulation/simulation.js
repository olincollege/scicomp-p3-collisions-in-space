// Contains logic to go through scene objects and update their vertices 
export default function updateSpaceObjects(spaceObjects, bodyTypesVisibility, surveysVisibility) {
    spaceObjects.forEach((spaceObject) => {

        // Update visibility
        const isVisible = bodyTypesVisibility[spaceObject.type] && surveysVisibility[spaceObject.survey]
        spaceObject.setVisibility(isVisible)
    })
}
