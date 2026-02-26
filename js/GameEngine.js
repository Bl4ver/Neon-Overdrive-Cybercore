class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentScene = null;
        this.state = new State(); // Pénz, inventory, stb.
    }

    // Jelenet váltás (Menü -> Játék -> Upgrade)
    setScene(newScene) {
        if (this.currentScene && this.currentScene.exit) this.currentScene.exit();
        this.currentScene = newScene;
        this.currentScene.init(this.state);
    }

    start() {
        const loop = () => {
            this.update();
            this.render();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    update() {
        if (this.currentScene) this.currentScene.update();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.currentScene) this.currentScene.render(this.ctx);
    }
}