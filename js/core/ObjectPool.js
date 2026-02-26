class ObjectPool {
    constructor(ClassType, initialSize = 100) {
        this.ClassType = ClassType; // Bullet, Bot, Enemy
        this.pool = [];
        
        // Előre legyártjuk az alapmennyiséget
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(new this.ClassType());
        }
    }

    // Kérünk egy szabad objektumot
    get() {
        // Megkeressük az első olyat, ami nincs használatban (active === false)
        let obj = this.pool.find(item => !item.active);

        // HA NINCS SZABAD OBJEKTUM: akkor bővítjük a pool-t
        if (!obj) {
            console.log("Pool bővítése..."); // Segít látni a fejlesztés alatt, mennyi kell valójában
            obj = new this.ClassType();
            this.pool.push(obj);
        }

        obj.active = true; // Aktiváljuk
        return obj;
    }

    // Itt nem töröljük le az objektumokat, csak láthatatlanná tesszük őket a ciklusnak
    releaseAll() {
        // Pl. szintváltáskor az összeset inaktívra tesszük
        this.pool.forEach(obj => obj.active = false);
    }
}