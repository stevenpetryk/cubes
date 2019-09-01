/** @type {HTMLCanvasElement} */
const canvas = document.querySelector("canvas")

const context = canvas.getContext("2d")
context.translate(canvas.width / 2, canvas.height / 2)

// Play around
const scale = 100
const cubeSize = 0.7

/** @type {HTMLInputElement} */
const alphaSlider = document.getElementById("alpha")
/** @type {HTMLInputElement} */
const betaSlider = document.getElementById("beta")
/** @type {HTMLInputElement} */
const xSlider = document.getElementById("x")
/** @type {HTMLInputElement} */
const ySlider = document.getElementById("y")
/** @type {HTMLInputElement} */
const zSlider = document.getElementById("z")

alphaSlider.addEventListener("input", () => render())
betaSlider.addEventListener("input", () => render())
xSlider.addEventListener("input", () => render())
ySlider.addEventListener("input", () => render())
zSlider.addEventListener("input", () => render())

function render() {
  const alpha = +alphaSlider.value
  const beta = +betaSlider.value

  const perspective = (alpha * Math.PI) / 180
  const cos30 = Math.cos(perspective)
  const sin30 = Math.sin(perspective)

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
    [+xSlider.value, +ySlider.value, +zSlider.value],
  ]

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  context.translate(canvas.width / 2, canvas.height / 2)

  /** @type [number, number][][] */
  let faces = []

  cubes.map(cube => {
    faces = faces.concat(cubeFaces(cube))
  })

  faces
    .sort((face1, face2) => {
      const [ax, ay, az] = faceCenter(face1.vertices)
      const [bx, by, bz] = faceCenter(face2.vertices)

      const aDistance = Math.sqrt((9999 - ax) ** 2 + (9999 + ay) ** 2 + (9999 - az) ** 2)
      const bDistance = Math.sqrt((9999 - bx) ** 2 + (9999 + by) ** 2 + (9999 - bz) ** 2)

      return bDistance - aDistance
    })
    .forEach(face => {
      const face2d = face.vertices.map(projectIsometric)
      context.beginPath()
      context.moveTo(...face2d[0])
      context.lineTo(...face2d[1])
      context.lineTo(...face2d[2])
      context.lineTo(...face2d[3])
      context.fillStyle = face.color
      context.fill()
      context.closePath()
    })

  function projectIsometric([x, y, z]) {
    const a = (alpha * Math.PI) / 180
    const b = (beta * Math.PI) / 180

    const m1 = math.matrix([
      [1, 0, 0],
      [0, Math.cos(a), Math.sin(a)],
      [0, -Math.sin(a), Math.cos(a)],
    ])

    const m2 = math.matrix([
      [Math.cos(b), 0, -Math.sin(b)],
      [0, 1, 0],
      [Math.sin(b), 0, Math.cos(b)],
    ])

    const m3 = math.matrix([[x], [y], [z]])

    const c = math.multiply(m1, m2)
    const d = math.multiply(c, m3)

    const identity = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 0]])

    const [bx, by] = math.multiply(identity, d)._data

    return [bx, -by].map(c => c * scale)
  }
}

function cubeFaces([x, y, z]) {
  const h = cubeSize / 2
  return [
    {
      vertices: [
        [x + h, y - h, z + h],
        [x + h, y + h, z + h],
        [x + h, y + h, z - h],
        [x + h, y - h, z - h],
      ],
      color: "#777",
    },
    {
      vertices: [
        [x + h, y - h, z + h],
        [x + h, y - h, z - h],
        [x - h, y - h, z - h],
        [x - h, y - h, z + h],
      ],
      color: "#333",
    },
    {
      vertices: [
        [x + h, y - h, z + h],
        [x - h, y - h, z + h],
        [x - h, y + h, z + h],
        [x + h, y + h, z + h],
      ],
      color: "#aaa",
    },
    {
      vertices: [
        [x - h, y + h, z - h],
        [x - h, y - h, z - h],
        [x - h, y - h, z + h],
        [x - h, y + h, z + h],
      ],
      color: "red",
    },
    {
      vertices: [
        [x - h, y + h, z - h],
        [x - h, y + h, z + h],
        [x + h, y + h, z + h],
        [x + h, y + h, z - h],
      ],
      color: "green",
    },
    {
      vertices: [
        [x - h, y + h, z - h],
        [x + h, y + h, z - h],
        [x + h, y - h, z - h],
        [x - h, y - h, z - h],
      ],
      color: "blue",
    },
  ]
}

function faceCenter(/** @type [number, number, number][] */ face) {
  let avgX = 0
  let avgY = 0
  let avgZ = 0

  face.slice(0, 4).forEach(([x, y, z]) => {
    avgX += x
    avgY += y
    avgZ += z
  })

  avgX /= face.length - 1
  avgY /= face.length - 1
  avgZ /= face.length - 1

  return [avgX, avgY, avgZ]
}

render()
