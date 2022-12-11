// prettier-ignore
const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random')
const math = require('canvas-sketch-util/math')
const Tweakpane = require('tweakpane')

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1080

const settings = {
    animate: true,
    dimensions: [CANVAS_WIDTH, CANVAS_HEIGHT],
}

interface Params {
    columns: number
    rows: number
    lineCap: 'round' | 'square' | 'butt'
    scaleMin: number
    scaleMax: number
    frequency: number
    amplitude: number
    frame: number
    animate: boolean
    speed: number
}

const params: Params = {
    columns: 10,
    rows: 10,
    lineCap: 'butt',
    scaleMax: 0.1,
    scaleMin: 30,
    frequency: 0.001,
    amplitude: 0.2,
    frame: 0,
    animate: true,
    speed: 10,
}

interface Props {
    context: CanvasRenderingContext2D
    width: number
    height: number
    time: number
    playhead: number
    frame: number
}

const sketch = ({ context, width, height, playhead, frame }: Props) => {
    return ({ context, width, height, playhead, frame }: Props) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)
        const numberOfRows: number = params.rows
        const numberOfColumns: number = params.columns
        const numberOfCells: number = numberOfRows * numberOfColumns

        const gridHeight: number = height * 0.8
        const gridWidth: number = width * 0.8

        const cellHeight: number = gridHeight / numberOfRows
        const cellWidth: number = gridWidth / numberOfColumns

        const xMargin: number = (width - gridWidth) * 0.5
        const yMargin: number = (height - gridHeight) * 0.5

        for (let index = 0; index < numberOfCells; index++) {
            const column: number = index % numberOfColumns
            const row: number = Math.floor(index / numberOfColumns)
            const x: number = column * cellWidth
            const y: number = row * cellHeight
            const width: number = cellWidth * 0.8
            const height: number = cellHeight * 0.8
            const animationframe = params.animate ? frame : params.frame

            /* const randomValue: number = random.noise2D(
                x + animationframe * params.speed,
                y,
                params.frequency
            ) */
            const randomValue: number = random.noise3D(
                x,
                y,
                animationframe * params.speed,
                params.frequency
            )
            const angle: number = Math.PI * randomValue * params.amplitude
            const scale = math.mapRange(
                randomValue,
                -1,
                1,
                params.scaleMin,
                params.scaleMax
            )

            context.save()
            context.translate(x, y)
            context.translate(xMargin, yMargin)
            context.translate(cellWidth * 0.5, cellHeight * 0.5)
            context.rotate(angle)

            context.lineWidth = scale
            context.lineCap = params.lineCap
            context.beginPath()
            context.moveTo(width * -0.5, 0)
            context.lineTo(width * 0.5, 0)
            context.stroke()
            context.restore()
        }
    }
}

const createPane = () => {
    const pane = new Tweakpane.Pane()
    let folder

    folder = pane.addFolder({ title: 'Grid' })
    folder.addInput(params, 'columns', { min: 5, max: 50, step: 1 })
    folder.addInput(params, 'rows', { min: 5, max: 50, step: 1 })
    folder.addInput(params, 'lineCap', {
        options: { butt: 'butt', round: 'round', square: 'square' },
    })
    folder.addInput(params, 'scaleMin', { min: 0.1, max: 100 })
    folder.addInput(params, 'scaleMax', { min: 1, max: 100 })
    folder = pane.addFolder({ title: 'Noise' })
    folder.addInput(params, 'frequency', { min: -0.01, max: 0.01 })
    folder.addInput(params, 'amplitude', { min: 0, max: 0.5 })
    folder.addInput(params, 'frame', { min: 1, max: 999 })
    folder.addInput(params, 'speed', { min: 10, max: 100 })
    folder.addInput(params, 'animate')
}

createPane()

canvasSketch(sketch, settings)
