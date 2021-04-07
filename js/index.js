const applyAttributes = (element, options) => (
    Object.keys(resolution).forEach(prop => element.setAttribute(prop, options[prop]))
)

const initializeVideo = () => {
    const video = root.querySelector("video")
    applyAttributes(video, resolution)

    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )

    video.addEventListener("play", () => {
        // const canvas = faceapi.createCanvasFromMedia(video)
        // const context = canvas.getContext("2d")
        // root.appendChild(canvas)
        
        // applyAttributes(canvas, resolution)
        
        window.animation = (async function render() {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 160,
                scoreThreshold: 0.45
            })).withFaceLandmarks().withFaceExpressions()

            // const results = faceapi.resizeResults(detections, resolution)
            
            // context.clearRect(0, 0, canvas.width, canvas.height)
            // faceapi.draw.drawFaceLandmarks(canvas, resized)
            // faceapi.draw.drawDetections(canvas, resized)
            // faceapi.draw.drawFaceExpressions(canvas, resized)

            if(renderer) {
                updateCube(detections[0])
                renderer.render(scene, camera)
            }

            return requestAnimationFrame(render)
        })()
    })

    return video
}

const changePosition = (box) => {
    const xPos = (box.left + box.width / 2)
    const xPercent = xPos / resolution.width
    
    const yPos = (box.top + box.height / 2)
    const yPercent = yPos / resolution.height

    return {
        x: (xPercent - 0.5) * 10, 
        y: (yPercent - 0.5) * -10
    }
}

const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
const map = (input, [in_min, in_max], [out_min, out_max]) => (input - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

const formatPoints = (data) => {
    const points = []
    for(const [key, value] of Object.entries(data)) {
        points.push([value._x, value._y])
    }
    return points
}

const allowNegativeIndex = (arr) => new Proxy(arr, {
    get(target, prop) {
        if (!isNaN(prop)) {
            prop = parseInt(prop, 10)
            if (prop < 0) {
                prop += target.length
            }
        }

        return target[prop]
    }
})

const updateCube = (results) => {
    const detection = results?.detection

    if(!detection) {
        return
    }

    const box = detection._box
    const points = formatPoints(results.landmarks._positions)

    Object.assign(cube.position, changePosition(box))


    const chin = points.slice(0, 17)
    const lEyebrow = allowNegativeIndex(points.slice(17, 22))
    const rEyebrow = allowNegativeIndex(points.slice(22, 27))
    const nose = points.slice(27, 36)
    const lEye = points.slice(36, 42)
    const rEye = points.slice(42, 48)
    const mouth = points.slice(48) 

    const eyeDistance = distance(rEye[2][0], rEye[2][1], lEye[1][0], lEye[1][1])
    const rotationalZ = Math.atan2(rEye[2][1] - lEye[1][1], rEye[2][0] - lEye[1][0])

    const lEyebrowLength = distance(lEyebrow[-1][0], lEyebrow[-1][1], lEyebrow[0][0], lEyebrow[0][1]) / eyeDistance
    const rEyebrowLength = distance(rEyebrow[-1][0], rEyebrow[-1][1], rEyebrow[0][0], rEyebrow[0][1]) / eyeDistance
    const eyebrowImplications = lEyebrowLength - rEyebrowLength
    const rotationalY = Math.radians(eyebrowImplications * 90) * 0.85

    const noseLength = nose[6][1] - nose[3][1]
    const rotationalX = Math.radians(Math.degrees((-Math.atan2(noseLength / eyeDistance, 0.05) + Math.radians(66))) * X_ROTATIONAL_SCALE) + Math.abs(rotationalY) 
    
    Object.assign(cube.rotation, {
        x: rotationalX,
        y: rotationalY,
        z: rotationalZ
    })

    const scaleFactor = map(noseLength, [10, 60], [1, 5])
    Object.assign(cube.scale, {
        x: scaleFactor,
        y: scaleFactor,
        z: scaleFactor
    })
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
]).then(initializeVideo)
