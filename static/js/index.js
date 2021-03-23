import * as faceapi from "./face-api/index.min.js"

const root = document.getElementById("root")

const initializeVideo = () => {
    const video = document.createElement("video")
    const attributes = {
        id: "video",
        width: 720,
        height: 560,
        autoplay: true
    }
    Object.keys(attributes).forEach(prop => video.setAttribute(prop, attributes[prop]))

    root.appendChild(video)

    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

initializeVideo()