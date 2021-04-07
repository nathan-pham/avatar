import { RESOLUTION } from "./constants.js"

Math.radians = (degrees) => degrees * Math.PI / 180
Math.degrees = (radians) => radians * 180 / Math.PI

export const applyAttributes = (element, options) => (
    Object.keys(RESOLUTION).forEach(prop => element.setAttribute(prop, options[prop]))
)

export const allowNegativeIndex = (arr) => new Proxy(arr, {
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

export const distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

export const map = (input, [in_min, in_max], [out_min, out_max]) => (input - in_min) * (out_max - out_min) / (in_max - in_min) + out_min