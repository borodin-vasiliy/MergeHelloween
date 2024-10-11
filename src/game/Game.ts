import Phaser from "phaser";

export default class Game extends Phaser.Game {
	public prevScene: string = 'Preload';

	public isYsdkInit: boolean = false;
	public ysdk: any | null = null;

	public storage: any = window.localStorage;
	public isStorageInit: boolean = false;

	public isGameReadySent: boolean = false;
	public lastFullscreeenAdsShowTime: number | null = null;

	public gameWidth: number;
	public gameHeight: number;
	public gameHalfWidth: number;
	public gameHalfHeight: number;

	public isMobile: boolean = false;

	constructor(GameConfig?: Phaser.Types.Core.GameConfig) {
		super(GameConfig);
		this.resize(GameConfig.width, GameConfig.height, GameConfig.zoom);
		Phaser.Display.Canvas.CanvasInterpolation.setBicubic(this.canvas);
	}

	resize(gameWidth, gameHeight, zoom) {
		this.gameWidth      = Math.round(Number(gameWidth));
		this.gameHeight     = Math.round(Number(gameHeight));
		this.gameHalfWidth  = Math.round(Number(gameWidth) / 2);
		this.gameHalfHeight = Math.round(Number(gameHeight) / 2);
		
		this.scale.resize(gameWidth, gameHeight);
		this.scale.setZoom(zoom);
	}

	setYsdk(ysdk: any) {
		if (!ysdk) {
			this.isStorageInit = true;
			this.updateIsYsdkInit();
			return;
		}

		this.ysdk = ysdk;
		this.ysdk.getStorage().then(storage => {
			this.storage = storage;
			this.isStorageInit = true;
			this.updateIsYsdkInit();
		});
	}

	updateIsYsdkInit() {
		this.isYsdkInit = this.isStorageInit;
	}

	sendGameReady() {
		if (!this.ysdk || this.isGameReadySent) {
			return;
		}

		this.ysdk.features.LoadingAPI?.ready();
		this.isGameReadySent = true;
	}

	showFullscreenAds(callback: CallableFunction) {
		if (!this.ysdk) {
			callback();
			return;
		}

		if (this.isFullscreenAdsCanBeShown()) {
			this.ysdk.adv.showFullscreenAdv({
			    callbacks: {
					onOpen: () => {
						this.sound.mute = true;
			        },
			        onClose: function() {
						this.sound.mute = false;
						this.lastFullscreeenAdsShowTime = Math.floor(Date.now() / 1000);
						callback();
			        }.bind(this),
			        onError: function() {
						callback();
			        }.bind(this),
			        onOffline: function() {
						callback();
			        }.bind(this)
			    }
			});
		} else {
			callback();
		}
	}

	isFullscreenAdsCanBeShown(): boolean {
		var currentTime = Math.floor(Date.now() / 1000);
		if (!this.lastFullscreeenAdsShowTime || currentTime > this.lastFullscreeenAdsShowTime + 90) {
			return true;
		}

		return false
	}

	showRewardedVideo(callback: CallableFunction) {
		if (!this.ysdk) {
			callback();
			return;
		}

		this.ysdk.adv.showRewardedVideo({
			callbacks: {
				onOpen: () => {
					this.sound.mute = true;
				},
				onRewarded: function() {
					callback();
				}.bind(this),
				onError: function() {
					callback();
				}.bind(this),
				onOffline: function() {
					callback();
				}.bind(this)
			}
		});
	}
}