class Bullet {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.active = false; // Alapból inaktív
    }

    spawn(x, y, targetX, targetY, speed) {
        this.x = x;
        this.y = y;
        
        if (this.x < targetX)
            this.speedX = 1
        else
            this.speedX = -1

        if (this.y < targetY)
            this.speedY = 1
        else
            this.speedY = -1

        this.active = true;
    }

    update() {
        if (!this.active) return;
        
        this.x += this.speedX;
        this.y += this.speedY;

        // Ha kimegy a képből, inaktívvá tesszük, hogy újra felhasználható legyen
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.active = false;
        }
    }
}

// JÁTÉK INDÍTÁSAKOR:
const bulletPool = new ObjectPool(Bullet, 100);

// LÖVÉSKOR:
function shoot(startX, startY) {
    const b = bulletPool.get(); // Ez vagy ad egy régit, vagy csinál egy újat
    b.spawn(startX, startY, mouse.x, mouse.y);
}