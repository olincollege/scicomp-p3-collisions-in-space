export default class SpaceObject {
    constructor(name, positions, stepInterval, size, group, startDate) {
        this.name = name
        this.positions = positions
        this.stepInterval = stepInterval
        this.currentPosition = this.positions[0]
        this.size = size
        this.group = group
        this.startDate = startDate
        this.mesh = this.initializeMesh()
    }

    initializeMesh = () => {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size, 12, 12),
            new THREE.MeshPhysicalMaterial({
                color: 'white',
                roughness: 0.75,
                flatShading: false
            })
        )
        mesh.position.x = this.currentPosition.x
        mesh.position.y = this.currentPosition.y
        mesh.position.z = this.currentPosition.z
        return mesh
    }

    updateMeshPosition = (position) => {
        this.mesh.position.x = position.x
        this.mesh.position.y = position.y
        this.mesh.position.z = position.z
    }

    updatePositionAtTime = (time) => {
        let positionIndex = Math.round(time / this.stepInterval)
        // ensure no indices are generated out of range
        positionIndex = Math.min(positionIndex, this.positions.length - 1)
        const newPosition = this.positions[positionIndex]
        this.currentPosition = newPosition
        this.updateMeshPosition(newPosition)
    }
}