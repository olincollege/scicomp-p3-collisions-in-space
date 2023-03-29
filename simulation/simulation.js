// contains logic to go through scene objects and update their vertices 
export default function updateMeshes(meshes, state) {
    meshes.forEach((mesh) => {
        mesh.rotation.y = state.time * (10 * Math.PI / 180);
    })
}