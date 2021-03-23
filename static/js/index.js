const socket = io()
const root = document.getElementById("root")
const modelPath = "/static/js/face-api/models"
const resolution = {
    width: 720,
    height: 560
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
        applyAttributes(canvas, resolution)
        root.appendChild(canvas)
        
        const animation = (async function render() {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 128,
                scoreThreshold: 0.4
            })).withFaceLandmarks().withFaceExpressions()
            const resized = faceapi.resizeResults(detections, resolution)
            context.clearRect(0, 0, canvas.width, canvas.height)
            faceapi.draw.drawDetections(canvas, resized)
            faceapi.draw.drawFaceLandmarks(canvas, resized)
            faceapi.draw.drawFaceExpressions(canvas, resized)

            // socket.emit("detections", detections)

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
