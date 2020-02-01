// Yousif Azami
// Assignment 1 
// TCSS 491

var AM = new AssetManager();
// 1. Download all spirtes and images
AM.queueDownload("./img/player.png");
AM.queueDownload("./img/background.png");

// 2. Call downloadAll function to initialize everything 
AM.downloadAll(function() {
    // Create canvas
    var canvas = document.getElementById("gameWorld");

    // Set context
    var ctx = canvas.getContext("2d");

    // Start the GameEngine
    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    // Add all of your entities (background, sprites, everything goes here)
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.png"), 640, 480));
    
    // Set Up Sprite Entity
    gameEngine.addEntity(new Player(gameEngine, AM.getAsset("./img/player.png")));
});

// Function for background
function Background(game, spritesheet, width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function (ctx) {
    ctx.drawImage(this.spritesheet, this.x, this.y);
};

Background.prototype.update = function () {
};




