import Phaser from "phaser";
import Game from "./game/Game";

import Boot from "./scenes/Boot";
import Preload from "./scenes/Preload";
import Level from "./scenes/Level";

import {Settings} from "./game/Settings";

declare var YaGames: any;
var game: Game | null;

const gameMinWidth  = 720;
const gameMinHeight = 1280;

var isGameLoaded = false;
var dotsCount:number = 0;
var timer;

window.addEventListener('touchmove', ev => {
	ev.preventDefault();
	ev.stopImmediatePropagation();
}, { passive: false });

drawDots();
window.addEventListener('load', function () {
	const container = document.getElementById(Settings.GAME_LOADING);
	container.style.color = String(Settings.LOADING_COLOR);

	var host = window.location.host.split(':')[0];
	if (
		(host == 'localhost' || host == '127.0.0.1')
		&& !getRequestParam('game_url')
	) {
		initGame();
		return;
	}

	(function(d) {
		var s = d.createElement('script');
        s.src = '/sdk.js';
        s.async = true;
        s.onload = () => {
			YaGames
				.init()
				.then(ysdk => {
					initGame(ysdk);
				});
		};
        d.body.append(s);
	})(document);
});

function drawDots() {
	const container = document.getElementById(Settings.GAME_LOADING);
	if (game?.isBooted) {
		isGameLoaded = true;
		container.innerHTML = '';
		return;
	}

	var dots = '';
	for (var i = 1; i <= dotsCount; i++) {
		dots += '.';
	}

	container.innerHTML = dots;

	timer = setTimeout(() => {
		dotsCount++;
		if (dotsCount > 5) {
			dotsCount = 0;
		}
		if (!isGameLoaded) drawDots();
	}, 200);
}

function getRequestParam(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	   return decodeURIComponent(name[1]);
}


function initGame(ysdk = null) {
	const container = document.getElementById(Settings.GAME_CONTAINER);
	var gameWidth   = container.offsetWidth;
	var gameHeight  = container.offsetHeight;
	if (ysdk && ysdk.deviceInfo.isMobile() && gameWidth < gameHeight) {
		setTimeout(function() {
			initGame(ysdk);
		}, 100);
		return;
	}

	createGame();
	game.setYsdk(ysdk);
	if (ysdk) {
		game.isMobile = ysdk.deviceInfo?.isMobile();
	}
	game.scene.start("Boot");
}

function createGame(): void {
	let widthHeightRatio = getGameSize();
	let gameWidth   = widthHeightRatio[0];
	let gameHeight  = widthHeightRatio[1];
	let gameRatio   = widthHeightRatio[2];

	game = new Game({
		width: gameWidth,
		height: gameHeight,
		scale: {
			parent: String(Settings.GAME_CONTAINER),
			mode: Phaser.Scale.ScaleModes.FIT,
    		autoCenter: Phaser.Scale.Center.CENTER_BOTH,
			zoom: gameRatio,
		},
		type: Phaser.WEBGL,
		scene: [Boot, Preload, Level],
		physics:{
        	default: 'matter',
        	arcade: {
				debug: false
			}
        },
		fps: {
			min: 20,
			target: 65,
			forceSetTimeOut: false,
			smoothStep: true,
		},
		render: {
			transparent: true,
			powerPreference: "high-performance", // low-power
			roundPixels: true,
		},
	});
}

function getGameSize() {
	const container = document.getElementById(Settings.GAME_CONTAINER);
	var gameWidth   = container.offsetWidth;
	var gameHeight  = container.offsetHeight;
	let gameRatio   = gameHeight / gameMinHeight;
	
	gameWidth  = gameWidth / gameRatio;
	gameHeight = gameMinHeight;
	if (gameWidth < gameMinWidth) {
		gameRatio  = gameWidth / gameMinWidth;
		gameWidth  = gameMinWidth;
		gameHeight = gameHeight / gameRatio;
		gameRatio  = container.offsetWidth / gameWidth;
	}

	return [gameWidth, gameHeight, gameRatio];
}