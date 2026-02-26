class Bot {
    constructor(config) {
        this.id = config.id;
        this.slots = config.slots; // Hány fegyverhelye van
        this.weapons = [];         // Ide kerülnek a Weapon példányok
        this.aiLevel = config.ai;  // Mennyire okos
    }
}