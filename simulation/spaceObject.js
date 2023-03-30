const highlightColor = 'red'

export default class SpaceObject {
    constructor(name, positions, stepInterval, size, group, startDate) {
        this.name = name
        this.positions = positions
        this.stepInterval = stepInterval
        this.currentPosition = this.positions[0]
        this.size = size
        this.group = group
        this.startDate = startDate
        this.objectMesh = this.createObjectMesh()
        this.objectColor = 'white'
        this.orbitMesh = this.createOrbitMesh()
    }

    createObjectMesh = () => {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size, 12, 12),
            new THREE.MeshPhysicalMaterial({
                color: this.objectColor,
                roughness: 0.75,
                flatShading: false
            })
        )
        mesh.position.x = this.currentPosition.x
        mesh.position.y = this.currentPosition.y
        mesh.position.z = this.currentPosition.z
        return mesh
    }

    createOrbitMesh = () => {
        const points = this.positions.map((position) => {
            return new THREE.Vector3(position.x, position.y, position.z)
        })
        const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, material);
    }

    updateMeshPosition = (position) => {
        this.objectMesh.position.x = position.x
        this.objectMesh.position.y = position.y
        this.objectMesh.position.z = position.z
    }

    updatePositionAtTime = (time) => {
        let positionIndex = Math.round(time / this.stepInterval)
        // ensure no indices are generated out of range
        positionIndex = Math.min(positionIndex, this.positions.length - 1)
        const newPosition = this.positions[positionIndex]
        this.currentPosition = newPosition
        this.updateMeshPosition(newPosition)
    }

    setVisibility = (isVisible) => {
        this.objectMesh.visible = isVisible
        this.orbitMesh.visible = isVisible
    }

    setHighlighted = (isHighlighted) => {
        const color = isHighlighted ? highlightColor : this.objectColor
        this.objectMesh.material.color.setColorName(color)
    }
}