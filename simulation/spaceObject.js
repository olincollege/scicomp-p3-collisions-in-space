const highlightColor = 'red'
const defaultColorMap = {
    'star': 'yellow',
    'planet': 'pink',
    'asteroid': 'grey'
}

export default class SpaceObject {
    constructor(name, type, group, size, positions, stepInterval, startDate, color = '') {
        this.name = name
        this.type = type
        this.group = group
        this.size = size
        this.positions = positions
        this.currentPosition = this.positions[0]
        this.stepInterval = stepInterval
        this.startDate = startDate
        this.objectMesh = this.createObjectMesh()
        this.orbitMesh = this.createOrbitMesh()

        if (color == '') {
            this.objectColor = defaultColorMap[type]
        } else {
            this.objectColor = color
        }
    }

    createObjectMesh = () => {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(this.size, 12, 12),
            new THREE.MeshPhysicalMaterial({
                color: this.objectColor,
                roughness: 1,
                flatShading: false,
                emissive: (this.type == 'star') ? 'yellow' : 'black',
            })
        )
        mesh.position.x = this.currentPosition.x
        mesh.position.y = this.currentPosition.y
        mesh.position.z = this.currentPosition.z
        return mesh
    }

    createOrbitMesh = () => {
        let points = this.positions.map((position) => {
            return new THREE.Vector3(position.x, position.y, position.z)
        })
        // add first position at end to close the loop
        points.push(new THREE.Vector3(this.positions[0].x, this.positions[0].y, this.positions[0].z))

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
