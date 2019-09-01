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
  let a = (alpha * Math.PI) / 180
  let b = (beta * Math.PI) / 180

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

  const cameraPos = math.matrix([[0], [0], [-10]])

  const [[cameraX], [cameraY], [cameraZ]] = math
    .multiply(rz(-b + Math.PI), rx(a), cameraPos)
    .toArray()
  const camera = [cameraX, cameraY, cameraZ]

  /** @type [number, number][][] */
  let faces = []

  cubes.map(cube => {
    faces = faces.concat(cubeFaces(cube))
  })

  const sortedFaces = faces.sort((face1, face2) => {
    const face1Center = faceCenter(face1.vertices)
    const face2Center = faceCenter(face2.vertices)

    return math.distance(face2Center, camera) - math.distance(face1Center, camera)
  })

  sortedFaces.forEach((face, index) => {
    const distance = math.distance(faceCenter(face.vertices), camera)
    // console.log(distance * 9)
    const face2d = face.vertices.map(vertices => projectIsometric(a, b, vertices))
    context.beginPath()
    context.moveTo(...face2d[0])
    context.lineTo(...face2d[1])
    context.lineTo(...face2d[2])
    context.lineTo(...face2d[3])
    context.fillStyle = face.color
    context.fill()
    context.closePath()
  })

  // guides(a, b)
}

function projectIsometric(a, b, [x, y, z]) {
  const point = math.matrix([[x], [y], [z]])
  const [bx, by] = math.multiply(orthogonalProjection, rx(a), rz(b), point).toArray()
  return [bx, by].map(c => c * scale)
}

const orthogonalProjection = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 0]])

function rx(t) {
  return math.matrix([[1, 0, 0], [0, Math.cos(t), -Math.sin(t)], [0, Math.sin(t), Math.cos(t)]])
}

function ry(t) {
  return math.matrix([[Math.cos(t), 0, Math.sin(t)], [0, 1, 0], [-Math.sin(t), 0, Math.cos(t)]])
}

function rz(t) {
  return math.matrix([[Math.cos(t), -Math.sin(t), 0], [Math.sin(t), Math.cos(t), 0], [0, 0, 1]])
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
      color: "violet",
    },
    {
      vertices: [
        [x + h, y - h, z + h],
        [x + h, y - h, z - h],
        [x - h, y - h, z - h],
        [x - h, y - h, z + h],
      ],
      color: "teal",
    },
    {
      vertices: [
        [x + h, y - h, z + h],
        [x - h, y - h, z + h],
        [x - h, y + h, z + h],
        [x + h, y + h, z + h],
      ],
      color: "tomato",
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
      color: "cyan",
    },
  ]
}

function faceCenter(/** @type [number, number, number][] */ face) {
  let avgX = 0
  let avgY = 0
  let avgZ = 0

  face.forEach(([x, y, z]) => {
    avgX += x
    avgY += y
    avgZ += z
  })

  avgX /= face.length
  avgY /= face.length
  avgZ /= face.length

  return [avgX, avgY, avgZ]
}

render()

function guides(a, b) {
  const x1 = projectIsometric(a, b, [0, 0, 0])
  const x2 = projectIsometric(a, b, [2, 0, 0])
  context.beginPath()
  context.strokeStyle = "red"
  context.lineWidth = 4
  context.moveTo(...x1)
  context.lineTo(...x2)
  context.stroke()
  context.closePath()

  const y1 = projectIsometric(a, b, [0, 0, 0])
  const y2 = projectIsometric(a, b, [0, 2, 0])
  context.beginPath()
  context.strokeStyle = "green"
  context.lineWidth = 4
  context.moveTo(...y1)
  context.lineTo(...y2)
  context.stroke()
  context.closePath()

  const z1 = projectIsometric(a, b, [0, 0, 0])
  const z2 = projectIsometric(a, b, [0, 0, 2])
  context.beginPath()
  context.strokeStyle = "blue"
  context.lineWidth = 4
  context.moveTo(...z1)
  context.lineTo(...z2)
  context.stroke()
  context.closePath()

  const w1 = projectIsometric(a, b, [0, 0, 0])
  const w2 = projectIsometric(a, b, [1, 1, 1])
  context.beginPath()
  context.strokeStyle = "orange"
  context.lineWidth = 10
  context.moveTo(...w1)
  context.lineTo(...w2)
  context.stroke()
  context.closePath()
}
