const canvasSketch = require('canvas-sketch')

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1080
const LINE_MAX_DISTANCE = 200
const LINE_MAX_WIDTH = 8

const settings = {
    dimensions: [CANVAS_WIDTH, CANVAS_HEIGHT],
}

interface Props {
    context: CanvasRenderingContext2D
    width: number
    height: number
    time: number
    playhead: number
}

let sketchManager: any

let fontFamily = 'serif'
let text = 'A'

const bitMapCanvas: HTMLCanvasElement = document.createElement('canvas')
const bitMapCanvasContext: CanvasRenderingContext2D | null = bitMapCanvas.getContext('2d')

const sketch = ({ context, width, height, playhead }: Props) => {

    if (bitMapCanvasContext != null) {

        const cellSize: number = 20
        const numberOfRows: number = Math.floor(width / cellSize)
        const numberOfColumns: number = Math.floor(height / cellSize)
        const numberOfCells: number = numberOfRows * numberOfColumns

        return () => {
            bitMapCanvasContext.fillStyle = 'black'
            bitMapCanvasContext.fillRect(0, 0, numberOfColumns, numberOfRows)

            bitMapCanvasContext.fillStyle = 'white'
            const fontSize = numberOfColumns * 1.2
            bitMapCanvasContext.font = `${fontSize}px ${fontFamily}`;
            bitMapCanvasContext.textBaseline = 'top'

            const metrics: TextMetrics = bitMapCanvasContext.measureText(text)
            const textXPosition: number = metrics.actualBoundingBoxLeft * -1
            const textYPosition: number = metrics.actualBoundingBoxAscent * -1
            const textWidth: number = metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft
            const textHeight: number = metrics.actualBoundingBoxDescent + metrics.actualBoundingBoxAscent

            const glyphXPosition = (numberOfColumns - textWidth) * 0.5 - textXPosition
            const glyphYPosition = (numberOfRows - textHeight) * 0.5 - textYPosition

            bitMapCanvasContext.save()
            bitMapCanvasContext.translate(glyphXPosition, glyphYPosition)

            bitMapCanvasContext.beginPath()
            bitMapCanvasContext.lineWidth = 2
            bitMapCanvasContext.rect(textXPosition, textYPosition, textWidth, textHeight);
            bitMapCanvasContext.stroke()

            bitMapCanvasContext.fillText(text, 0, 0);

            bitMapCanvasContext.restore()

            const bitMapPixels: Uint8ClampedArray = bitMapCanvasContext.getImageData(0, 0, numberOfColumns, numberOfRows).data

            context.fillStyle = 'black'
            context.fillRect(0, 0, width, height)

            context.textAlign = 'center'
            context.textBaseline = 'middle'

            // context.drawImage(bitMapCanvas, 0, 0)

            for (let index = 0; index < bitMapPixels.length; index++) {
                const column: number = index % numberOfColumns
                const row: number = Math.floor(index / numberOfColumns)
                const xPosition: number = column * cellSize
                const yPosition: number = row * cellSize

                const red: number = bitMapPixels[index * 4 + 0]
                const green: number = bitMapPixels[index * 4 + 1]
                const blue: number = bitMapPixels[index * 4 + 2]

                const fontSize: number = Math.random() < 0.1 ? 4 : 2
                context.font = `${cellSize * fontSize}px ${fontFamily}`
                context.fillStyle = 'white'
                // context.fillStyle = `rgb(${red}, ${green}, ${blue})`

                const glyph: string = getGlyph(red)

                context.save()
                context.translate(xPosition, yPosition)

                context.fillText(glyph, 0, 0)

                //context.fillRect(0, 0, cellSize, cellSize)

                //context.translate(cellSize * 0.5, cellSize * 0.5)
                //context.beginPath
                //context.arc(0, 0, cellSize * 0.5, 0, Math.PI * 2)
                //context.fill()
                context.restore()

            }

        }
    }
}

const getGlyph = (colorValue: number): string => {
    const getRandomItem = (itemArray: string[]): string => {
        const randomIndex: number = Math.floor(Math.random() * itemArray.length)
        return itemArray[randomIndex]
    }

    if (colorValue < 50) return ''
    if (colorValue < 100) return '.'
    if (colorValue < 150) return '-'
    if (colorValue < 200) return '+'
    const glyphs: string[] = '_=/'.split('')
    const randomGlyph: string = getRandomItem(glyphs)
    return randomGlyph

}

const onKeyUp = (event: KeyboardEvent): void => {
    text = event.key.toUpperCase()
    sketchManager.render()
}

document.addEventListener('keyup', onKeyUp)

const startSketch = async () => {
    sketchManager = await canvasSketch(sketch, settings)
}

startSketch()

