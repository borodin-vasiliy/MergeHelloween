import Scene from "./SceneAbstract";
import {Objects} from "../game/Settings";

export default class Preload extends Scene {
	constructor() {
		super("Preload");
	}

	preload() {
		this.load.image("headstone", "assets/headstone.png");
		this.load.image("newgame", "assets/new-game.png");
		for (let i = 0; i <= 9; i++) {
			this.load.image(`${i}`, `assets/numbers/${i}.png`);
		}
		for (const object of Objects) {
			this.load.image(`${object.name}`, `assets/objects/${object.name}.png`);
		}
	}

	create() {
		this.openMainScene();
	}

	openMainScene() {
		if (!this.game.isYsdkInit) {
			this.time.addEvent({
				delay: 100,
				callback: () => {
					this.openMainScene();
				},
				callbackScope: this,
				loop: false
			});
			return;
		}

		this.game.sendGameReady();
		this.scene.start("Level");
	}
}
