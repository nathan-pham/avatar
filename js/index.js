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
        
        const animation = (async function render() {
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

const updateCube = (results) => {
    const box = results?.detection?._box

    if(!box) {
        return
    }
    
    const xPos = (box.left + box.width / 2)
    const xPercent = xPos / 640

    const yPos = (box.top + box.height / 2)
    const yPercent = yPos / 360

    TweenMax.to(cube.position, 0.2, {x: (xPercent - 0.5) * 10, y: (yPercent - 0.5) * -10, ease: Linear.easeNone});
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
]).then(initializeVideo)
