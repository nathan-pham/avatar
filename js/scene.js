const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, 640 / 360, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()

renderer.setSize(640, 360)
camera.position.z = 5

root.appendChild(renderer.domElement)

const createCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial({})
    return new THREE.Mesh(geometry, material)
}

const cube = createCube()
scene.add(cube)