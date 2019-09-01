/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas")

const context = canvas.getContext("2d")
context.translate(canvas.width / 2, canvas.height / 2)

// Play around
const angle = 25
const scale = 100
const cubeSize = 0.2

const perspective = (angle * Math.PI) / 180
const cos30 = Math.cos(perspective)
const sin30 = Math.sin(perspective)

/** @type {HTMLInputElement} */
const xSlider = document.getElementById("x")
/** @type {HTMLInputElement} */
const ySlider = document.getElementById("y")
/** @type {HTMLInputElement} */
const zSlider = document.getElementById("z")

xSlider.addEventListener("input", () => render())
ySlider.addEventListener("input", () => render())
zSlider.addEventListener("input", () => render())

function render() {
  /** @type {[number, number, number][]} */
  const cubes = [
    [0, 0, 0],
    [0, 0, 1],
    [0, 0, 2],
    [0, 0, 0],
    [0, 1, 0],
    [0, 2, 0],
    [0, 0, 0],
    [1, 0, 0],
    [2, 0, 0],
    [+xSlider.value, +ySlider.value, +zSlider.value]
  ]

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  context.translate(canvas.width / 2, canvas.height / 2)

  cubes
    .sort(([ax, ay, az], [bx, by, bz]) => {
      const aDistance = Math.sqrt((9999 - ax) ** 2 + (9999 + ay) ** 2 + (9999 - az) ** 2)
      const bDistance = Math.sqrt((9999 - bx) ** 2 + (9999 + by) ** 2 + (9999 - bz) ** 2)

      return bDistance - aDistance
    })
    .forEach(([x, y, z, color]) => {
      const faces = cubeFaces([x, y, z])
      const colors = ["#555", "#999", "#bbb"]

      faces.forEach((face, index) => {
        console.log(face)
        context.beginPath()
        context.moveTo(...face[0])
        context.lineTo(...face[1])
        context.lineTo(...face[2])
        context.lineTo(...face[3])
        context.fillStyle = colors[index]
        context.fill()
        context.closePath()
      })

      context.fillStyle = color
    })
}

function projectIsometric([x, y, z]) {
  const x_2d = x * cos30 + y * cos30
  const y_2d = z + y * sin30 - x * sin30

  return [x_2d, -y_2d].map(c => c * scale)
}

function cubeFaces([x, y, z]) {
  const h = cubeSize
  return [
    [
      projectIsometric([x + h, y - h, z + h]),
      projectIsometric([x + h, y + h, z + h]),
      projectIsometric([x + h, y + h, z - h]),
      projectIsometric([x + h, y - h, z - h])
    ],
    [
      projectIsometric([x + h, y - h, z + h]),
      projectIsometric([x + h, y - h, z - h]),
      projectIsometric([x - h, y - h, z - h]),
      projectIsometric([x - h, y - h, z + h])
    ],
    [
      projectIsometric([x + h, y - h, z + h]),
      projectIsometric([x - h, y - h, z + h]),
      projectIsometric([x - h, y + h, z + h]),
      projectIsometric([x + h, y + h, z + h])
    ]
  ]
}

render()
