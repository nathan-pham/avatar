const root = document.getElementById("root")
const modelPath = "/js/face-api/models"
const resolution = {
    width: 640,
    height: 360
}
const X_ROTATIONAL_SCALE = 3

Math.radians = (degrees) => degrees * Math.PI / 180
Math.degrees = (radians) => radians * 180 / Math.PI