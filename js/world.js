import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.127.0/build/three.module.js"
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.127.0/examples/jsm/loaders/GLTFLoader.js"
import { ROOT, RESOLUTION, ENVIRONMENT_COLOR } from "./constants.js"

class World {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, RESOLUTION.width / RESOLUTION.height, 0.1, 1000)
    renderer = new THREE.WebGLRenderer()
    
    constructor() {
        this.scene.background = new THREE.Color(ENVIRONMENT_COLOR)
        this.renderer.setSize(RESOLUTION.width, RESOLUTION.height)
        this.camera.position.z = 7

        ROOT.appendChild(this.renderer.domElement)
    }

    update() {
        this.renderer.render(this.scene, this.camera)
    }

    add(obj) {
        this.scene.add(obj)
    }

    resize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight, false)

        const canvas = this.renderer.domElement
        this.camera.aspect = canvas.clientWidth / canvas.clientHeight
        this.camera.updateProjectionMatrix()
    }
}

export const createAmbientLight = () => new THREE.AmbientLight(0xffffff)
export const createDirectionalLight = (intensity, position) => {
    const directionalLight = new THREE.DirectionalLight(ENVIRONMENT_COLOR, intensity)
    directionalLight.position.set(...position)
    directionalLight.castShadow = false
    return directionalLight
}
export const createPointLight = (intensity, position) => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, intensity)
    directionalLight.position.set(...position)
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

// export const loadSky = async (modelPath) => {
//     const geometry = new THREE.SphereGeometry( 500, 60, 40 )
// 	geometry.scale( - 1, 1, 1 )

//     const texture = new THREE.TextureLoader().load(modelPath)
//     const material = new THREE.MeshBasicMaterial({ map: texture })
//     const mesh = new THREE.Mesh(geometry, material)

//     return mesh
//     // const loader = new THREE.TextureLoader()
//     // const texture = await loader.loadAsync(modelPath)
//     // console.log("loaded sky")

//     // const cubeMap = new THREE.WebGLCubeRenderTarget(texture.image.height).fromEquirectangularTexture(world.renderer, texture)
//     // return cubeMap

// }

export const loadSky = async (modelPath) => {
    const textureLoader = new THREE.TextureLoader()
    const texture = await textureLoader.loadAsync(modelPath)
    
    console.log("loaded sky")

    // , function (texture){
    //      var material = new THREE.MeshBasicMaterial();
    //      material.envMap = texture;
}

    // const path = 'textures/cube/SwedishRoyalCastle/';
	// 			const format = '.jpg';
	// 			const urls = [
	// 				path + 'px' + format, path + 'nx' + format,
	// 				path + 'py' + format, path + 'ny' + format,
	// 				path + 'pz' + format, path + 'nz' + format
	// 			];

	// 			const reflectionCube = new THREE.CubeTextureLoader().load( urls );
	// 			const refractionCube = new THREE.CubeTextureLoader().load( urls );
	// 			refractionCube.mapping = THREE.CubeRefractionMapping;

}

export default World