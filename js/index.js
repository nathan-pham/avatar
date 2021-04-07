import { FACE_API_MODEL_PATH, RIG_MODEL_PATH, RESOLUTION, X_ROTATIONAL_SCALE, STATUS_ICONS } from "./constants.js"
import World, { createAmbientLight, createDirectionalLight, loadModel } from "./world.js"
import { applyAttributes, allowNegativeIndex, formatPoints, distance, map } from "./utils.js"

const world = new World()
world.add(createAmbientLight())
world.add(createDirectionalLight(5, [0, -15, 0]))
world.add(createDirectionalLight(15, [5,  -5, 5]))
world.add(createDirectionalLight(15, [-5, -5, 5]))
// world.add(createPointLight(10, [0, -15, 0]))

const loadFaceAPI = (modelPath) => {
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
    ])

    console.log("loaded face api")
}

const startFaceAPI = (faceObject) => {
    const video = document.querySelector("video")
    applyAttributes(video, {
        width: 180,
        height: 112
    })

    navigator.getUserMedia({ video: {} }, stream => video.srcObject = stream, console.error)

    video.addEventListener("play", () => {
        window.animation = (async function render() {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 128
                // scoreThreshold: 0.2
            })).withFaceLandmarks().withFaceExpressions()

            const resized = faceapi.resizeResults(detections, RESOLUTION)[0]


            if(resized) {
                positionObject(faceObject, resized)
                displayStatus(resized)
            }

            // skyObject.rotation.y += 0.001
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
        (xPercent - 0.5) * 10, 
        (yPercent - 0.5) * -10,
        z
    ]
}


const displayStatus = (results) => {
    const detection = results?.detection

    if(!detection) {
        return
    }

    const box = detection._box
    const span = document.querySelector("span")

    let min = 0
    let status = "default"
    for(const [key, value] of Object.entries(results.expressions || {})) {
        if(value > min) {
            min = value
            status = key
        }
    }

    span.textContent = STATUS_ICONS[status]
}

const positionObject = (object, results) => {
    const detection = results?.detection

    if(!detection) {
        return
    }

    const box = detection._box
    const points = formatPoints(results.landmarks._positions)

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
    const rotationalY = Math.radians(eyebrowImplications * 90)

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

    // const sky = await loadSky(SKY_MODEL_PATH)
    // world.add(sky)

    startFaceAPI(model)
}

initialize()

window.addEventListener("resize", () => world.resize())