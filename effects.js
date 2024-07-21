import { ctx } from './script.js'
export class Effect {
    static darken = (hex, percent) => {
        hex = hex.replace(/^#/, '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        r = Math.round(r * (1 - percent / 100));
        g = Math.round(g * (1 - percent / 100));
        b = Math.round(b * (1 - percent / 100));
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        return '#' + [r, g, b].map(c => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;

        }).join('');
    }
    static all = [] //Every Effect
    static images = [new Image(50, 50)]
    static choose(...a) {
        return a[Math.floor(Math.random() * a.length)]
    } //Pick something random
    static toKill = [] // Kill these before redraw
    static colors = ['#ff7b00', '#6aff00', '#00ff08', '#00ff62', '#00ffcc', '#007bff', '#1e00ff', '#6a00ff', '#ff0062', '#ff0000']
    static shapes = new Map() // We have a map for the shapes instead of a switch statement
    static start() {
        //Spawn the shapes
        for (let i = 30; i--;) {
            let n = new Special({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                size: Math.random() * 30, shape: 4, filter: 'difference', color: '#FFFFFF'
            }

            )
            n.velocity.az = n.random[0] / 10

        }

    }
    static {
        //Other stuff
        this.images[0].src = './zoozi.png'
        this.shapes.set('square', function () {
            Effect.drawRect.call(this)
            return true
        })
        this.shapes.set('circle', function () {
            Effect.drawCircle.call(this)
            return true
        })
    }
    static frame = 0
    static middle = {
        //Center of the canvas
        x: canvas.width / 2,
        y: canvas.height / 2
    }
    static empty = () => {
        this.all.length = 0
    }
    static drawRect(params) {
        ctx.fillRect(params?.x ?? 0, params?.y ?? 0, params?.size ?? this.size, params?.size ?? this.size)
        ctx.strokeRect(params?.x ?? 0, params?.y ?? 0, params?.size ?? this.size, params?.size ?? this.size)

    }
    static drawCircle(params) {
        ctx.arc(params?.x ?? 0, params?.y ?? 0, params?.size ?? this.size, params?.startAngle ?? 0, params?.endAngle ?? (Math.PI * 2))
        ctx.fill()
        ctx.stroke()
    }
    static Text(txt) {
        ctx.fontBaseline = 'middle'
        ctx.textAlign = 'center'
        ctx.font = `bold ${this.size}px sans`;
        ctx.fillText(txt ?? this.shape, 0, 0)
        ctx.strokeText(txt ?? this.shape, 0, 0)

    }
    static Glow(blur, color) {
        ctx.shadowBlur = blur ?? 15
        ctx.shadowColor = color ?? 'blue'
    }
    static doThisEveryFrame = {
        //Every x frames execute a callback function
        '40': () => {
            let n = new Special({
                x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                size: 40, lifetime: 30, shape: '[Zoozi]', filter: 'difference', color: '#FFFFFF'
            }

            )
        }

    }
    static Update = function U() {
        //Update loop
        this.frame++
        requestAnimationFrame(() => {
            U.call(this)
        })

        for (let o of Object.keys(Effect.doThisEveryFrame)) {
            //Loop over the every x frames
            if (!(this.frame % +o)) {
                Effect.doThisEveryFrame[o]()
            }
        }
        let width = canvas.width,
            height = canvas.height

        let img = Effect.images[0]
        //Draw an image if there is one
        img && ctx.drawImage(Effect.images[0], 0, 0, width, height)
        for (let obj of this.toKill) {
            //Remove them from the normal loop
            this.all.splice(this.all.indexOf(obj), 1)
        }
        //Then empty it
        this.toKill = []
        for (let obj of this.all) {
            //Loop over everything to draw
            obj.lifetime--
            obj.draw(this.frame)
        }
    }
    constructor(params) {
        let { x, y, size, shape, colour, color, darkBorder, lifetime, filter } = params ?? {}
        this.x = x ?? Effect.middle.x;
        this.y = y ?? Effect.middle.y;
        this.size = size ?? 10;
        this.dead = false
        this.shape = shape ?? 0;
        if (color === 'random' || colour === 'random') {
            color = Effect.choose(...Effect.colors)
        }
        this.random = [Math.random() * Effect.choose(1, -1), Math.random() * Effect.choose(1, -1), Math.random() * Effect.choose(1, -1), Math.random() * Effect.choose(1, -1), Math.random() * Effect.choose(1, -1)]
        this.colour = colour ?? color ?? '#000000';
        this.lifetime = lifetime ?? -1
        this.filter = filter ?? 'source-over'
        this.rot = {
            x: 1,
            y: 1,
            z: 0
        }
        this.opacity = 1
        this.velocity = {
            x: 0,
            y: 0,
            ax: 0, //Horizontal rotation
            ay: 0, //Vertical rotation
            az: 0 //Normal 2D rotation
        }

        if (darkBorder) {
            this.outline = '#000000'
            this.border = false
        }
        else {
            this.outline = Effect.darken(this.colour, 30)
            this.border = true
        }
        Effect.all.push(this)
        //I now exist
    }
    /**
     * @param {hex} col
     */
    set color(col) {
        this.colour = col
        if (this.border) {
            this.outline = Effect.darken(col, 30)
        }
    }
    get index() {
        //i dont feel like explaining this
        const out = {
            group: Effect.all,
            index: -1
        }
        let index = Effect.toKill.indexOf(this)
        if (index > -1) {
            out.group = Effect.toKill;
            out.index = index
        }
        else {
            out.index = Effect.all.indexOf(this)
        }
        return out;
    }
    destroyImmediate() {
        //The actual 'Kill'
        if (this.index.group === Effect.toKill) {
            return;
        }
        Effect.toKill.push(this)
    }
    kill() {
        /*the default kill function just kills as normal 
        but can be overwritten to add effects like fade out*/
        this.destroyImmediate()
    }
    draw(frame) {
        if (this.dead && this.index.group === Effect.all) {
            this.kill()
        }
        if (!this.lifetime) {
            this.dead = true

        }
        this.x += this.velocity.x;
        this.y += this.velocity.y
        this.rot.z += this.velocity.az
        this.rot.x += this.velocity.ax
        this.rot.y += this.velocity.ay
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rot.z)
        ctx.scale(Math.sin(this.rot.x), Math.sin(this.rot.y))
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = this.colour
        ctx.strokeStyle = this.outline
        ctx.lineWidth = 3
        ctx.globalCompositeOperation = this.filter
        this.illustrate?.()
        ctx.restore()
    }
    illustrate(frame) {
        ctx.beginPath()
        if (!Effect.shapes.get(this.shape)?.call?.(this)) {
            if (this?.shape?.match?.(/\[*\]/)) {
                //Draw the text instead
                Effect.Text.call(this, this.shape.slice(1, this.shape.length - 1))
                return
            }
            ctx.moveTo(this.size, this.size)
            if (typeof this.shape !== 'number') {
                //You idiot
                throw Error('Invalid shape: ' + this.shape + '\nIt must be [text], type Number or a string matching the correct shape')
            }

            for (let i = 0; i < this.shape; i++) {
                //Default Polygon
                ctx.lineTo(this.size, this.size)
                ctx.rotate(Math.PI / (this.shape / 2))
            }
            ctx.closePath()
            ctx.fill()
            ctx.stroke()
        }
    }
}
export class Strange extends Effect {
    constructor(opts) {
        super(opts)
    }
    draw(frame) {

        //this.rot = Math.cos(frame/10)/4
        this.velocity.x += (-Math.abs(Math.cos(frame)) * this.random[0]) / 30
        this.velocity.y = -Math.abs(Math.cos((frame - (this.random[0] * 100)) / 30))
        super.draw()

    }
    illustrate() {
        ctx.beginPath()
        Effect.Glow(3, this.colour)
        ///ctx.fillStyle = 'rgb(0,0,0,0)'
        Effect.drawCircle.call(this)
    }
}
export class Special extends Effect {
    constructor(opts) {
        super(opts)
        this.filter = opts.filter ?? 'source-over'
    }
    static Motion = new Map()
    static {
        for (let axis of ['x', 'y']) {
            let cos = Math.cos
            let sin = Math.sin
            let acos = Math.acos
            let asin = Math.asin
            let cosh = Math.cosh
            let sinh = Math.sinh
            if (axis === 'y') {
                cos = Math.sin
                sin = Math.cos
                acos = Math.asin
                asin = Math.acos
                cosh = Math.sinh
                sinh = Math.cosh
            }
            this.Motion.set('swirl' + axis, (intensity, frame) => {
                return sin(frame * (intensity ?? 1))
            })

        }
    }

    kill() {
        this.opacity -= 0.05
        this.opacity = Math.max(0, this.opacity)
        if (!this.opacity) {
            this.destroyImmediate()
        }
    }
    draw(frame) {
        this.velocity.x = this.random[0] * 4
        this.velocity.y = this.random[1] * 4

        super.draw()
    }
}