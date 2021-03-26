/* Web-Based-VR-Tutorial Project Template
 * Author: Evan Suma Rosenberg <suma@umn.edu> and Blair MacIntyre <blair@cc.gatech.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * 
 * Sample adapted from https://playground.babylonjs.com/#TAFSN0#323
 */ 

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { AssetsManager } from "@babylonjs/core/Misc/assetsManager"

// Side effects
import "@babylonjs/core/Helpers/sceneHelpers";

// add this to import the controller models from the online repository
import "@babylonjs/loaders"

// More necessary side effects
import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/inspector";


class Game 
{ 
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    constructor()
    {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true); 

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);   

    }

    start() : void 
    {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => { 
                this.update();
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => { 
                this.engine.resize();
            });
        });
    }

    private async createScene() 
    {
        // This creates and positions a first-person camera (non-mesh)
        var camera = new UniversalCamera("camera1", new Vector3(0, 1.6, 0), this.scene);

        // This sets the camera direction
        camera.setTarget(new Vector3(0, 1.6, 1));

        // This attaches the camera to the canvas
        camera.attachControl(this.canvas, true);
    
        // Default Environment
        //var environment = this.scene.createDefaultEnvironment({ enableGroundShadow: true, groundYBias: 2.8 });
        //environment!.setMainColor(Color3.FromHexString("#74b9ff"))

        var ambientlight = new HemisphericLight("ambient", new Vector3(0, 1, 0), this.scene);
        ambientlight.intensity = 1.0;
        ambientlight.diffuse = new Color3(.3, .3, .3);

        var directionalLight = new DirectionalLight("light", new Vector3(0, -0.5, 1.0), this.scene);
        directionalLight.intensity = 1.0;   
    
        // Initialize WebXR
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({ });

        // Disable default teleportation
        xrHelper.teleportation.dispose();

        // The assets manager can be used to load multiple assets
        var assetsManager = new AssetsManager(this.scene);


        // Create a task for each asset you want to load
        var objTask = assetsManager.addMeshTask("obj task", "", "assets/", "dragonite.obj");
        objTask.onSuccess = (task) => {
            objTask.loadedMeshes[0].name = "dragonite";
            objTask.loadedMeshes[0].position = new Vector3(0, 1, 2);
            objTask.loadedMeshes[0].scaling = new Vector3(2, 2, 2);
            objTask.loadedMeshes[0].rotation = new Vector3(0, Math.PI, 0);
        }

        var worldTask = assetsManager.addMeshTask("world task", "", "assets/", "world.glb");
        worldTask.onSuccess = (task) => {
            worldTask.loadedMeshes[0].name = "world";
            worldTask.loadedMeshes[0].position = new Vector3(-75, -22, -50);
            
            worldTask.loadedMeshes.forEach((mesh) => {
                console.log("loaded mesh: " + mesh.name);
            })
        }


        // This loads all the assets and displays a loading screen
        assetsManager.load();

        // This will execute when all assets are loaded
        assetsManager.onFinish = (tasks) => {

        }
    
        // Show the debug scene explorer and object inspector
        this.scene.debugLayer.show(); 
    }

    // The main update loop will be executed once per frame before the scene is rendered
    private update() : void
    {
 
    }

}
/******* End of the Game class ******/   

// start the game
var game = new Game();
game.start();