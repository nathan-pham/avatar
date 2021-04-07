import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.127.0/build/three.module.js"
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/GLTFLoader.js"
import { ROOT, RESOLUTION } from "./constants.js"

class World {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, RESOLUTION.height / RESOLUTION.width, 0.1, 1000)
    renderer = new THREE.WebGLRenderer()
    
    constructor() {
        this.scene.background = new THREE.Color(0xdddddd)
        this.renderer.setSize(RESOLUTION.height, RESOLUTION.width)
        this.camera.position.z = 5

        ROOT.appendChild(this.renderer.domElement)
    }

    update() {
        this.renderer.render(this.scene, this.camera)
    }

    add(obj) {
        this.scene.add(obj)
    }
}

export const createAmbientLight = () => new THREE.AmbientLight(0x404040, 100)
export const createDirectionalLight = () => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 50)
    directionalLight.position.set(0,1,0)
    directionalLight.castShadow = false
    return directionalLight
}


export const createCube = () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshNormalMaterial({})
    return new THREE.Mesh(geometry, material)
}

export const loadModel = (modelPath) => {
    const loader = new GLTFLoader()
    return loader.loadAsync(modelPath).then(data => {
        console.log("loaded scene")
        return data.scene.children[0]
    })
}

export default World