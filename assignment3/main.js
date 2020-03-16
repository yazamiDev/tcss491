// Yousif Azami
// TCSS 491
// Assignment 3

window.onload = function () {

    var gameEngine = new GameEngine();

    var NUMBER_COPS = 7;
    var NUMBER_ROBBERS = 15;
    var NUMBER_PRISONERS = 0;

    var socket = io.connect("https://24.16.255.56:8888");

    socket.on("load", function (data) {
        console.log(data);
        // Remove existing data 
        removeAllCopsRobbersPrisoners();

        // Add new data
        addLoadedGame(data.data);
    });

    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");
    var resetButton = document.getElementById("reset");

    saveButton.onclick = function () {
        console.log("save");
        var myCurrentGameStatus = [];
        for (var i = 0; i < gameEngine.entities.length; i++) {
            // Create all fields needed for circle 
            var tempEntit = { color: "", x: "", y: "", velocity: "" };
            var ent = gameEngine.entities[i];
            tempEntit.color = ent.it;
            tempEntit.x = ent.x;
            tempEntit.y = ent.y;
            tempEntit.velocity = ent.velocity;
            myCurrentGameStatus[i] = tempEntit;
        }
        // console.log(myCurrentGameStatus);
        socket.emit("save", { studentname: "Yousif Azami", statename: "saveMode", data: myCurrentGameStatus });
    };

    loadButton.onclick = function () {
        console.log("load");
        socket.emit("load", { studentname: "Yousif Azami", statename: "saveMode" });
    };

    resetButton.onclick = function () {
        console.log("Resetting Game...");
        // Remove all current entities
        removeAllCopsRobbersPrisoners();
        // Set up new cops and robbers
        setUpCopsRobbers();
    };

    function distance(a, b) {
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function Circle(game, theType, theX, theY, theVelocity) {
        this.player = 1;
        this.radius = 20;
        this.visualRadius = 500;
        switch (theType) {
            case "blue":
                this.color = "blue";
                this.setCop();
                break;
            case "red":
                this.color = "red";
                this.setRobber();
                break;
            case "white":
                this.color = "white";
                this.setPrisoner();
                break;
        }

        if (theX) {
            Entity.call(this, game, this.radius + theX, this.radius + theY);
        } else {
            Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
        }

        if (theVelocity) {
            this.velocity = theVelocity;
        } else {
            this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
        }
        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > maxSpeed) {
            var ratio = maxSpeed / speed;
            this.velocity.x *= ratio;
            this.velocity.y *= ratio;
        }
    };

    Circle.prototype = new Entity();
    Circle.prototype.constructor = Circle;

    // Create the cop 
    Circle.prototype.setCop = function () {
        this.it = "blue";
        this.visualRadius = 500;
    };

    // Create the robber
    Circle.prototype.setRobber = function () {
        this.it = "red";
        this.visualRadius = 1000;
    };

    // Create the prisoner
    Circle.prototype.setPrisoner = function () {
        this.it = "white";
        this.velocity = { x: 0, y: 0 };
        this.x = this.x;
        this.y = this.y;
    };

    Circle.prototype.collide = function (other) {
        return distance(this, other) < this.radius + other.radius;
    };

    Circle.prototype.collideLeft = function () {
        return (this.x - this.radius) < 0;
    };

    Circle.prototype.collideRight = function () {
        return (this.x + this.radius) > 800;
    };

    Circle.prototype.collideTop = function () {
        return (this.y - this.radius) < 0;
    };

    Circle.prototype.collideBottom = function () {
        return (this.y + this.radius) > 800;
    };

    Circle.prototype.update = function () {
        Entity.prototype.update.call(this);
        //  console.log(this.velocity);

        // If this is a prisoner then don't move
        if (this.it == "white") {

        } else {
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }

        if (this.collideLeft() || this.collideRight()) {
            this.velocity.x = -this.velocity.x * friction;
            if (this.collideLeft()) this.x = this.radius;
            if (this.collideRight()) this.x = 800 - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }

        if (this.collideTop() || this.collideBottom()) {
            this.velocity.y = -this.velocity.y * friction;
            if (this.collideTop()) this.y = this.radius;
            if (this.collideBottom()) this.y = 800 - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }

        for (var i = 0; i < this.game.entities.length; i++) {
            // The other object
            var ent = this.game.entities[i];
            if (ent !== this && this.collide(ent)) {
                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;

                // If its a cop and catches a robber change the robber to prison
                if (this.it == "blue" && ent.it == "red") {
                    ent.setPrisoner();
                }

                // If robber touches prison make it a robber
                if (this.it == "red" && ent.it == "white") {
                    ent.setRobber();
                }
            }

            if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
                var dist = distance(this, ent);
                // Behaviour of cop with robber 
                if (this.it == "blue" && ent.it == "red") {
                    if (this.it == "blue" && dist > this.radius + ent.radius + 10) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * acceleration / (dist * dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                    if (ent.it == "red" && dist > this.radius + ent.radius) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * acceleration / (dist * dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                }
                else if (this.it == "red" && ent.it == "blue") {
                    if (this.it == "red" && dist > this.radius + ent.radius + 100) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * acceleration / (dist * dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                    if (ent.it == "blue" && dist > this.radius + ent.radius) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x -= difX * acceleration / (dist * dist);
                        this.velocity.y -= difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                }
                else if (this.it == "red" && ent.it == "white") {
                    if (this.it == "red" && dist > this.radius + ent.radius + 1000) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x -= difX * acceleration / (dist * dist);
                        this.velocity.y -= difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                    if (ent.it == "white" && dist > this.radius + ent.radius) {
                        var difX = (ent.x - this.x) / dist;
                        var difY = (ent.y - this.y) / dist;
                        this.velocity.x += difX * acceleration / (dist * dist);
                        this.velocity.y += difY * acceleration / (dist * dist);
                        var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                        if (speed > maxSpeed) {
                            var ratio = maxSpeed / speed;
                            this.velocity.x *= ratio;
                            this.velocity.y *= ratio;
                        }
                    }
                }


            }
        }
        this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
        this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
    };

    Circle.prototype.draw = function (ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.it;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();

    };

    // the "main" code begins here
    var friction = 1;
    var acceleration = 1000000;
    var maxSpeed = 150;

    var ASSET_MANAGER = new AssetManager();

    ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
    ASSET_MANAGER.queueDownload("./img/black.png");
    ASSET_MANAGER.queueDownload("./img/white.png");

    ASSET_MANAGER.downloadAll(function () {
        console.log("starting up da sheild");
        var canvas = document.getElementById('gameWorld');
        var ctx = canvas.getContext('2d');
        setUpCopsRobbers();
        gameEngine.init(ctx);
        gameEngine.start();
    });

    // setUpCopsRobbers is a helper function to set up cops and robbers
    function setUpCopsRobbers() {
        var circle = new Circle(gameEngine);
        // Set the cops (blue)
        for (var i = 0; i < NUMBER_COPS; i++) {
            circle = new Circle(gameEngine, "blue");
            gameEngine.addEntity(circle);
        }

        // Set the robbers (red)
        for (var i = 0; i < NUMBER_ROBBERS; i++) {
            circle = new Circle(gameEngine, "red");
            gameEngine.addEntity(circle);
        }


        // Set the prisoner (white)
        for (var i = 0; i < NUMBER_PRISONERS; i++) {
            circle = new Circle(gameEngine, "white");
            gameEngine.addEntity(circle);
        }
    }

    // Helper function that removes all cops, robbers, and prisoners
    function removeAllCopsRobbersPrisoners() {
        for (var i = 0; i < gameEngine.entities.length; i++) {
            var ent = gameEngine.entities[i];
            ent.removeFromWorld = true;
        }
    }

    // addLoadedGame sets up the game
    function addLoadedGame(theList) {
        var circle = new Circle(gameEngine);
        for (var i = 0; i < theList.length; i++) {
            circle = new Circle(gameEngine, theList[i].color, theList[i].x, theList[i].y, theList[i].velocity);
            gameEngine.addEntity(circle);
        }
    }
};
