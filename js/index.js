import { ROOT, FACE_API_MODEL_PATH, RIG_MODEL_PATH, RESOLUTION, X_ROTATIONAL_SCALE } from "./constants.js"
import { applyAttributes, allowNegativeIndex, distance, map } from "./utils.js"
import World, { createAmbientLight, createDirectionalLight, createPointLight, loadModel } from "./world.js"

const world = new World()
world.add(createAmbientLight())
world.add(createDirectionalLight(5, [1, -15, 0]))
world.add(createPointLight(10, [0, 300, 500]))

const loadFaceAPI = (modelPath) => {
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
    ])

    console.log("loaded face api")
}

const startFaceAPI = (object) => {
    const video = ROOT.querySelector("video")
    applyAttributes(video, RESOLUTION)

    navigator.getUserMedia({ video: {} }, stream => video.srcObject = stream, console.error)

    video.addEventListener("play", () => {
        window.animation = (async function render() {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 160,
                scoreThreshold: 0.45
            })).withFaceLandmarks().withFaceExpressions()

            const resized = faceapi.resizeResults(detections, RESOLUTION)
            positionObject(object, resized[0])
            world.update()

            return requestAnimationFrame(render)
        })()
    })
}

const changePosition = (box, z=0) => {
    const xPos = (box.left + box.width / 2)
    const xPercent = xPos / RESOLUTION.width
    
    const yPos = (box.top + box.height / 2)
    const yPercent = yPos / RESOLUTION.height

    return [
        (xPercent - 0.5) * -10, 
        (yPercent - 0.5) * -10,
        z
    ]
}

const formatPoints = (data) => {
    const points = []
    for(const [key, value] of Object.entries(data)) {
        points.push([value._x, value._y])
    }
    return points
}

const positionObject = (object, results) => {
    const detection = results?.detection

    if(!detection) {
        return
    }

    const box = detection._box
    const points = formatPoints(results.landmarks._positions)

    // Object.assign(object.position, newLocation)

    const lEyebrow = allowNegativeIndex(points.slice(17, 22))
    const rEyebrow = allowNegativeIndex(points.slice(22, 27))
    const nose = points.slice(27, 36)
    const lEye = points.slice(36, 42)
    const rEye = points.slice(42, 48)
    // const chin = points.slice(0, 17)
    // const mouth = points.slice(48) 

    const eyeDistance = distance(rEye[2][0], rEye[2][1], lEye[1][0], lEye[1][1])
    const rotationalZ = Math.atan2(rEye[2][1] - lEye[1][1], rEye[2][0] - lEye[1][0])

    const lEyebrowLength = distance(lEyebrow[-1][0], lEyebrow[-1][1], lEyebrow[0][0], lEyebrow[0][1]) / eyeDistance
    const rEyebrowLength = distance(rEyebrow[-1][0], rEyebrow[-1][1], rEyebrow[0][0], rEyebrow[0][1]) / eyeDistance
    const eyebrowImplications = lEyebrowLength - rEyebrowLength
    const rotationalY = Math.radians(eyebrowImplications * 90) * 0.85

    const noseLength = nose[6][1] - nose[3][1]
    const rotationalX = Math.radians(Math.degrees((-Math.atan2(noseLength / eyeDistance, 0.05) + Math.radians(66))) * X_ROTATIONAL_SCALE) + Math.abs(rotationalY) 
    
    object.rotation.set(rotationalX - 1.5, rotationalY, rotationalZ)

    const newLocation = changePosition(box, map(noseLength + eyeDistance, [80, 350], [0, 5]))
    object.position.set(...newLocation)
}

const initialize = async () => {
    await loadFaceAPI(FACE_API_MODEL_PATH)

    const model = await loadModel(RIG_MODEL_PATH)
    world.add(model)
    startFaceAPI(model)
}

initialize()