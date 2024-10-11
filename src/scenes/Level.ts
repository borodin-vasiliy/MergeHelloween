import Scene from "./SceneAbstract";

import {Settings, Objects} from "../game/Settings";

export default class Level extends Scene {
	score: number = 0;
	isGameOver: boolean = false;
	headstoneWidth: number = 700;
	headstoneHeight: number = 1000;

	particles: Phaser.GameObjects.Particles.ParticleEmitter;
	scoreBox: Phaser.GameObjects.RenderTexture;
	objects: Phaser.GameObjects.Group;
	dropper: Phaser.GameObjects.Image;
	restartButton: Phaser.GameObjects.Image;

	ceiling: MatterJS.BodyType;

	constructor() {
		super("Level");
	}

	create() {
		this.score = 0;
  		this.isGameOver = false;

		this.setupParticles();
		this.setupHeadstone();
		this.drawScore();
		this.setupCeiling();
		this.setupDropper();
		this.setupRestartButton();
		this.setupEvents();
	}
	  
	// Define the particles to be created when a pair of objects collide
	setupParticles() {
		this.particles = this.add.particles(0, 0, Objects[0].name, {
			lifespan: 1000,
			speed: { min: 200, max: 350 },
			scale: { start: 0.1, end: 0 },
			rotate: { start: 0, end: 360 },
			alpha: { start: 1, end: 0 },
			gravityY: 200,
			emitting: false
		});
	}
	  
	setupHeadstone() {
		// Draw the image of the headstone
		this.add
			.nineslice(this.game.gameHalfWidth, this.game.gameHeight, "headstone")
			.setOrigin(0.5, 1)
			.setDisplaySize(this.headstoneWidth, this.headstoneHeight)
			.setDepth(-2);
	  
		// Define a box where the score will be drawn at the top of the headstone
		this.scoreBox = this.add.renderTexture(
			this.game.gameHalfWidth, this.game.gameHeight - this.headstoneHeight + 150,
			this.headstoneWidth - 300, 100
		).setScale(0.8);
	  
		// Create a grup of objects to put all the falling objects
		this.objects = this.add.group();
	  
		// Define the limits of the headstone where the objects will be located
		this.matter.world.setBounds(
			(this.game.gameWidth - this.headstoneWidth) / 2 + 75, 0,
			this.headstoneWidth - 150, this.game.gameHeight - 1
		);
	}
	  
	// Draw a line to check when the objects reach the top of the headstone
	setupCeiling() {
		this.ceiling = this.matter.add.rectangle(
			this.game.gameHalfWidth, this.game.gameHeight - this.headstoneHeight + 200,
			this.headstoneWidth, 200
		);
		this.ceiling.isStatic = true;
	  
		const line = this.add
			.rectangle(this.game.gameHalfWidth - this.headstoneWidth / 2 + 200, this.game.gameHeight - this.headstoneHeight + 200, 300, 2, 0xccccff)
			.setOrigin(0)
			.setAlpha(0.1)
			.setDepth(-2);
		line.postFX.addShine();
		line.postFX.addGlow();
	}
	  
	// Configure the dropper with the first object and add a glow effect
	setupDropper() {
		this.dropper = this.add.image(this.input.activePointer.x, 0, Objects[0].name);
		const glow = this.dropper.postFX.addGlow(0x99ddff);
		this.tweens.addCounter({
		  	yoyo: true, repeat: -1, from: 1, to: 3, duration: 1000,
			onUpdate: tween => glow.outerStrength = tween.getValue()
		});
		this.updateDropper(Objects[0]);
	}
	  
	// When the game is over a button is shown to restart the game
	setupRestartButton() {
		const centerX = this.game.gameHalfWidth;
		const centerY = this.game.gameHalfHeight;
		const button = this.add.image(centerX, centerY, "newgame")
			.setScale(0.4)
			.setInteractive({ useHandCursor: true })
			.setVisible(false);
	  
		const tweenOptions = scale => ({ targets: button, scale, ease: "Linear", duration: 100 });
	  
		button.on("pointerover", () => this.tweens.add(tweenOptions(0.5)));
		button.on("pointerout", () => this.tweens.add(tweenOptions(0.4)));
		button.on("pointerup", () => this.restart());
		this.restartButton = button;
	}
	  
	// Configure all the events that will be used in the game (dropper and objects collisions)
	setupEvents() {
		console.log('1');
		this.input.on("pointermove", (pointer) => {
			console.log('2');
			this.moveDropper(pointer);
		}, this);
		this.input.on("pointerdown", (pointer) => {
			this.moveDropper(pointer);
		}, this);
		this.input.on("pointerup", (pointer) => {
			this.nextObject()
		}, this);
		this.matter.world.on('collisionstart', (event) => {
			this.handleCollisions(event);
		});
	}

	/* ====== */

	setDropperX(x) {
		const padding = (this.game.gameWidth - this.headstoneWidth) / 2 + 75;
		const radius = this.dropper.displayWidth / 2;
		const maxWidth = this.game.gameWidth - radius - padding;
		x = Math.max(radius + padding + 10, Math.min(x, maxWidth));
		this.dropper.setX(x);
	}
	  
	// Moves the dropper when the event "pointermove" happens
	moveDropper(pointer) {
		this.setDropperX(pointer.x);
	}
	  
	// Updates the image of the dropper when the event "pointerup" happens
	updateDropper(object) {
		this.dropper
			.setTexture(object.name)
			.setName(object.name)
			.setDisplaySize(object.radius * 2, object.radius * 2)
			.setY(object.radius + this.game.gameHeight - this.headstoneHeight + 310);
		this.setDropperX(this.input.activePointer.x);
	  
		// Check which object is the same as the one in the dropper and make it shine
		this.objects.getChildren().forEach((gameObject) => {
			if (gameObject instanceof Phaser.GameObjects.Image) {
				gameObject.postFX.clear();
	  
				if (gameObject.name === object.name) gameObject.postFX.addShine();
		  	}
		});
	}
	  
	// Renders the score inside the box defined previously
	drawScore() {
		this.scoreBox.clear();
		const chars = this.score.toString().split("");
	  
		const textWidth = chars.reduce((acc, c) => acc + this.textures.get(c).get().width, 0);
	  
		let x = (this.scoreBox.width - textWidth) / 2;
	  
		chars.forEach(char => {
			this.scoreBox.drawFrame(char, undefined, x, 0);
		  	x += this.textures.get(char).get().width;
		});
	}
	  
	addObject(x, y, object) {
		this.objects.add(this.matter.add
		  	.image(x, y, object.name)
		  	.setName(object.name)
		  	.setDisplaySize(object.radius * 2, object.radius * 2)
		  	.setCircle(object.radius)
		  	.setFriction(0.005)
		  	.setBounce(0.2)
		  	.setDepth(-1)
		  	.setOnCollideWith(this.ceiling, () => {
				this.gameOver();
			}));
	}
	  
	  // Creates and puts a new object on the headstone
	nextObject() {
		if (!this.dropper.visible || this.isGameOver) return;
	  
		this.dropper.setVisible(false);
		this.time.delayedCall(500, () => {
			this.dropper.setVisible(!this.isGameOver);
		});
	  
		this.addObject(
			this.dropper.x, this.dropper.y,
			Objects.find(object => object.name === this.dropper.name)
		);
	  
		this.updateDropper(Objects[Math.floor(Math.random() * 5)]);
	}
	  
	// Function executed when two objects of the same type collide
	handleCollisions(event) {
		for (const { bodyA, bodyB } of event.pairs) {
			if (bodyA.gameObject?.name === bodyB.gameObject?.name) {
				if (navigator.vibrate) navigator.vibrate(50);
			
				const objectIndex = Objects.findIndex(object => object.name === bodyA.gameObject.name);
				if (objectIndex === -1) return;
		
				this.score += (objectIndex + 1) * 2;
				this.drawScore();
		
				bodyA.gameObject.destroy();
				bodyB.gameObject.destroy();
		
				this.particles
				.setTexture(Objects[objectIndex].name)
				.emitParticleAt(bodyB.position.x, bodyB.position.y, 10);
				
				const newObject = Objects[objectIndex + 1];
				if (!newObject) return;
		
				this.addObject(bodyB.position.x, bodyB.position.y, newObject);
				return;
		  	}
		}
	}
	  
	gameOver() {
		this.isGameOver = true;
		this.restartButton.setVisible(true);
		this.dropper.setVisible(false);
	}
	  
	restart() {
		this.score = 0;
		this.isGameOver = false;
		this.scene.restart();
	}
}
