import { degToRad } from "three/src/math/MathUtils"

const scaleFactor = 1
const defaultObjectSize = 5000000000

const defaultColorMap = {
    'star': { object: 'yellow', orbit: 'black' },
    'planet': { object: 'pink', orbit: 'purple' },
    'asteroid': { object: 'grey', orbit: 'grey' }
}
const defaultOrbitColor = 'grey'
const objectHighlightColor = 'red'
const orbitHighlightColor = 'blue'

export default class SpaceObject {
    constructor(orbit, type, group, color = '') {
        // data available from processed data
        this.name = orbit["name"]
        this.id = orbit["id"]
        this.pos = orbit["pos"]
        this.semimajor = orbit["semi-major"]
        this.semiminor = orbit["semi-minor"]
        this.i = orbit["i"]
        this.node = orbit["node"]
        this.peri = orbit["peri"]
        this.v = orbit["v"]

        // attributes to configure manually
        this.type = type
        this.group = group
        if (color == '') {
            this.objectColor = defaultColorMap[type].object
            this.orbitColor = defaultColorMap[type].orbit
        } else {
            this.objectColor = color
            this.orbitColor = defaultOrbitColor
        }

        // size should be pulled from a database
        this.size = defaultObjectSize

        // initialize object meshes
        this.objectMesh = this.createObjectMesh()
        this.orbitMesh = this.createOrbitMesh()
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
        mesh.position.set(this.pos.x * scaleFactor, this.pos.y * scaleFactor, this.pos.z * scaleFactor)

        return mesh
    }

    createOrbitMesh = () => {
        console.log(this.semimajor, this.semimajor)
        const curve = new THREE.EllipseCurve(
            0, 0,
            this.semimajor * scaleFactor, this.semiminor * scaleFactor,
            0, 2 * Math.PI,
            false,
            degToRad(this.peri),
        );
        const points = curve.getPoints(128);

        const material = new THREE.LineBasicMaterial({ color: this.orbitColor });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material);

        const orbitMesh = new THREE.Object3D()
        orbitMesh.add(line)

        orbitMesh.rotateZ(degToRad(this.node))
        orbitMesh.rotateX(degToRad(this.i))
        console.log(orbitMesh)
        return orbitMesh
    }

    setVisibility = (isVisible) => {
        this.objectMesh.visible = isVisible
        this.orbitMesh.visible = isVisible
    }

    setHighlighted = (isHighlighted) => {
        const objectColor = isHighlighted ? objectHighlightColor : this.objectColor
        this.objectMesh.material.color.setColorName(objectColor)
        const orbitColor = isHighlighted ? orbitHighlightColor : this.orbitColor
        this.orbitMesh.children[0].material.color.setColorName(orbitColor)

        // only show orbit when highlighted
        // this.orbitMesh.children[0].material.color.setColorName(orbitColor)
        // this.orbitMesh.visible = isHighlighted
    }
}
