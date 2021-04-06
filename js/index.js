const root = document.getElementById("root")
const modelPath = "/static/js/face-api/models"
const resolution = {
    width: 640,
    height: 360
}

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
        const canvas = faceapi.createCanvasFromMedia(video)
        const context = canvas.getContext("2d")
        root.appendChild(canvas)
        
        applyAttributes(canvas, resolution)
        
        const animation = (async function render() {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 160,
                scoreThreshold: 0.45
            })).withFaceLandmarks().withFaceExpressions()

            const resized = detections
            // faceapi.resizeResults(detections, resolution)
            
            context.clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawFaceLandmarks(canvas, resized)
            faceapi.draw.drawDetections(canvas, resized)
            faceapi.draw.drawFaceExpressions(canvas, resized)

            return requestAnimationFrame(render)
        })()
    })

    return video
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceExpressionNet.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
]).then(initializeVideo)
