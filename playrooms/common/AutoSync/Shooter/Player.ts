import { Bullet } from './entities/Bullet'
import { Location } from './entities/Location'

export class Player {
    @share('Location | null') location: nullable<Location> = null
    @share('vec2') pos: vec2
    @share('number') secredCard: number
    @share('number') publicCard: number

    constructor() {
        this.pos = new vec2({ x: 19, y: 19 })

        this.secredCard = Math.floor(Math.random() * 10)
        this.publicCard = Math.floor(Math.random() * 10)
    }

    move(move: vec2) {
        if (this.location == null) {
            return
        }

        this.pos = this.pos.add(move.unit())
        if (this.pos.x < 0) {
            this.pos.x = 0
        }
        if (this.pos.y < 0) {
            this.pos.y = 0
        }
        if (this.pos.x > this.location.w) {
            this.pos.x = this.location.w
        }
        if (this.pos.y > this.location.h) {
            this.pos.y = this.location.h
        }
    }

    fire(direction: vec2) {
        if (this.location == null) {
            return
        }

        const bullet = new Bullet()
        bullet.creator = this
        bullet.pos = this.pos
        bullet.speed = direction.unit().multiply(0.1)
    }
}
