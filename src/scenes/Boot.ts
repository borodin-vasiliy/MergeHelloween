import Scene from "./SceneAbstract";

export default class Preload extends Scene {
	constructor() {
        super("Boot");
    }

    preload() {
    }

    create() {
        this.scene.start("Preload");
	}
}
