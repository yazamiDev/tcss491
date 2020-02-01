// Yousif Azami
// Assignment 1 
// TCSS 491

// Player inheritance 
function Player(game, spritesheet) {
    // Set all types of animations 
    this.idleAnimation = new Animation(spritesheet, 65, 64, 10, .5, 1, true, 1, 0, 650);
    this.upAnimation = new Animation(spritesheet, 65, 64, 9, 0.2, 9, true, 1, 10, 520);
    this.downAnimation = new Animation(spritesheet, 65, 64, 9, 0.2, 9, true, 1, 10, 650);
    this.rightAnimation = new Animation(spritesheet, 65, 64, 9, 0.2, 9, true, 1, 10, 710);
    this.leftAnimation = new Animation(spritesheet, 65, 64, 9, 0.2, 8, true, 1, 10, 585);

    this.specialAnimation = new Animation(spritesheet, 61, 65, 9, 0.2, 4, true, 1, 0, 900);

    // Set the current animation to idle
    this.currentAnimation = this.idleAnimation;
    this.speed = 8;
    this.direction = 0;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 0);
}

Player.prototype = new Entity();
Player.prototype.constructor = Player;

Player.prototype.update = function () {
    if (this.game.keyboardManager.pressedKeys[68]) {
        this.currentAnimation = this.rightAnimation;
        this.direction = 2;
        this.x += 2;
    } else if (this.game.keyboardManager.pressedKeys[65]) {
        this.currentAnimation = this.leftAnimation;
        this.direction = 1;
        this.x -= 2;
    } else if (this.game.keyboardManager.pressedKeys[87]) {
        this.currentAnimation = this.upAnimation;
        this.direction = 0;
        this.y -= 2;
    } else if (this.game.keyboardManager.pressedKeys[83]) {
        this.currentAnimation = this.downAnimation;
        this.direction = 3;
        this.y += 2;
    } else if (this.game.keyboardManager.pressedKeys[32]) {
        this.currentAnimation = this.specialAnimation;
    } else {
        this.currentAnimation = this.idleAnimation;
    }

}

Player.prototype.draw = function () {
    this.currentAnimation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}


// Animation 
// Initialize animation
function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale, xCoord, yCoord) {
    this.xCoord = xCoord;
    this.yCoord = yCoord;
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameDuration = frameDuration;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) {
            this.elapsedTime = 0;
        }
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);
    ctx.drawImage(this.spriteSheet, this.xCoord + xindex * this.frameWidth, this.yCoord + yindex * this.frameHeight,
        this.frameWidth, this.frameHeight, x, y, this.frameWidth * this.scale, this.frameHeight * this.scale);
}



