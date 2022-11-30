import { off } from 'process'

const canvasSketch = require('canvas-sketch')

const CANVAS_WIDTH = 1080
const CANVAS_HEIGHT = 1080
const LINE_MAX_DISTANCE = 200
const LINE_MAX_WIDTH = 8

const settings = {
    animate: true,
    dimensions: [CANVAS_WIDTH, CANVAS_HEIGHT],
}

interface Props {
    context: CanvasRenderingContext2D
    width: number
    height: number
    time: number
    playhead: number
}

const sketch = ({ context, width, height, playhead }: Props) => {
    const getRandomInt = (min: number, max: number): number => {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min) + min)
    }

    function getRandomArbitrary(min: number, max: number): number {
        return Math.random() * (max - min) + min
    }

    const getLineWidth = (distance: number): number => {
        return (
            (Math.abs(distance - LINE_MAX_DISTANCE) / LINE_MAX_DISTANCE) *
            LINE_MAX_WIDTH
        )
    }

    const figures: Figure[] = []

    for (let index = 0; index < 40; index++) {
        const radius: number = getRandomInt(4, 16)
        const circle = new Circle(radius)
        const offset = radius
        const xVelocity = getRandomArbitrary(-1, 1)
        const yVelocity = getRandomArbitrary(-1, 1)
        const xPosition = getRandomInt(0 + offset, width - offset)
        const yPosition = getRandomInt(0 + offset, height - offset)
        const figure = new Figure(
            xPosition,
            yPosition,
            circle,
            xVelocity,
            yVelocity
        )
        figures.push(figure)
    }

    return ({ context, width, height, playhead }: Props) => {
        context.fillStyle = 'white'
        context.fillRect(0, 0, width, height)

        for (let index = 0; index < figures.length; index++) {
            const figure = figures[index]
            for (
                let otherIndex = index + 1;
                otherIndex < figures.length;
                otherIndex++
            ) {
                const otherFigure = figures[otherIndex]
                const distance = figure.position.distance(otherFigure.position)
                if (distance > LINE_MAX_DISTANCE) continue
                context.beginPath()
                context.lineWidth = getLineWidth(distance)
                context.moveTo(figure.position.x, figure.position.y)
                context.lineTo(otherFigure.position.x, otherFigure.position.y)
                context.stroke()
            }
        }

        figures.forEach((figure) => {
            figure.update()
            figure.bounce()
            figure.draw(context)
        })
    }
}

canvasSketch(sketch, settings)

class Circle {
    radius: number
    constructor(radius: number) {
        this.radius = radius
    }
}

class Vector {
    x: number
    y: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    distance(vector: Vector): number {
        const xDistance = Math.abs(this.x - vector.x)
        const yDistance = Math.abs(this.y - vector.y)
        return Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    }
}

class Figure {
    circle: Circle
    radius: number
    position: Vector
    velocity: Vector
    constructor(
        xPosition: number,
        yPosition: number,
        circle: Circle,
        xVelocity: number,
        yVelocity: number
    ) {
        this.circle = circle
        this.position = new Vector(xPosition, yPosition)
        this.velocity = new Vector(xVelocity, yVelocity)
    }

    draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = 'white'
        context.save()
        context.translate(this.position.x, this.position.y)
        context.beginPath()
        context.arc(0, 0, this.circle.radius, 0, 2 * Math.PI)
        context.fill()
        context.lineWidth = 4
        context.stroke()
        context.restore()
    }

    update(): void {
        this.position.x = this.position.x + this.velocity.x
        this.position.y = this.position.y + this.velocity.y
    }

    bounce(): void {
        if (this.position.x <= 0 || this.position.x >= CANVAS_WIDTH)
            this.velocity.x = this.velocity.x * -1
        if (this.position.y <= 0 || this.position.y >= CANVAS_HEIGHT) {
            this.velocity.y = this.velocity.y * -1
        }
    }
}
