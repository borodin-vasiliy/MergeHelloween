import Phaser from "phaser";
import Game from "../game/Game";
import {Settings} from "../game/Settings";

export default class Scene extends Phaser.Scene {
	declare game: Game;
	fps: Phaser.GameObjects.Text = null;

	constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	update(time, delta) {
		if (this.fps) {
			this.fps.destroy();
		}

		this.fps = this.add.text(10, 10, String(Math.floor(1000 / delta)), {
			fontFamily: 'Arial',
			fontSize: 44,
			color: String(Settings.COLOR_BLACK),
		});
	}

	changeScene(scaneName: string, callback: Function = null) {
		this.tweens.add({
			targets: this.cameras.main,
			alpha: 0,
			duration: 150,
			repeat: 0,
			onComplete: () => {
				this.game.showFullscreenAds(() => {
					this.scene.start(scaneName);
				});
			}
		});
	}

	sceneLoaded(): void {
		this.scale.on('resize', this.onResize, this);
	}

	// abstract
	onResize(): void {}
}