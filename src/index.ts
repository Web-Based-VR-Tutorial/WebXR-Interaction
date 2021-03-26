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
import { Logger } from "@babylonjs/core/Misc/logger";
import { WebXRControllerComponent } from "@babylonjs/core/XR/motionController/webXRControllercomponent";
import { WebXRInputSource } from "@babylonjs/core/XR/webXRInputSource";
import { WebXRCamera } from "@babylonjs/core/XR/webXRCamera";
import { Axis } from "@babylonjs/core/Maths/math.axis";
import { Quaternion } from "@babylonjs/core/Maths/math.vector";

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

    private xrCamera: WebXRCamera | null; 
    private leftController: WebXRInputSource | null;
    private rightController: WebXRInputSource | null;

    constructor()
    {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true); 

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);   

        // Initialize XR camera and controller member variables
        this.xrCamera = null;
        this.leftController = null;
        this.rightController = null;
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

        // Assigns the web XR camera to a member variable
        this.xrCamera = xrHelper.baseExperience.camera;

        // Assign the left and right controllers to member variables
        xrHelper.input.onControllerAddedObservable.add((inputSource) => {

            if(inputSource.uniqueId.endsWith("left")) 
            {
                this.leftController = inputSource;
            }
            else 
            {
                this.rightController = inputSource;
            }  
        });


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
        // Polling for controller input
        this.processControllerInput();  
    }

    // Process event handlers for controller input
    private processControllerInput()
    {
        this.onLeftTrigger(this.leftController?.motionController?.getComponent("xr-standard-trigger"));
        this.onLeftSqueeze(this.leftController?.motionController?.getComponent("xr-standard-squeeze"));
        this.onLeftThumbstick(this.leftController?.motionController?.getComponent("xr-standard-thumbstick"));
        this.onLeftX(this.leftController?.motionController?.getComponent("x-button"));
        this.onLeftY(this.leftController?.motionController?.getComponent("y-button"));

        this.onRightTrigger(this.rightController?.motionController?.getComponent("xr-standard-trigger"));
        this.onRightSqueeze(this.rightController?.motionController?.getComponent("xr-standard-squeeze"));
        this.onRightThumbstick(this.rightController?.motionController?.getComponent("xr-standard-thumbstick"));
        this.onRightA(this.rightController?.motionController?.getComponent("a-button"));
        this.onRightB(this.rightController?.motionController?.getComponent("b-button"));
    }


    private onLeftTrigger(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("left trigger pressed");
            }
            else
            {
                Logger.Log("left trigger released");
            }
        }     
    }

    private onLeftSqueeze(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("left squeeze pressed");
            }
            else
            {
                Logger.Log("left squeeze released");
            }
        }  
    }

    private onLeftX(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("left X pressed");
            }
            else
            {
                Logger.Log("left X released");
            }
        }  
    }

    private onLeftY(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("left Y pressed");
            }
            else
            {
                Logger.Log("left Y released");
            }
        }  
    }

    private onLeftThumbstick(component?: WebXRControllerComponent)
    {   
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("left thumbstick pressed");
            }
            else
            {
                Logger.Log("left thumbstick released");
            }
        }  

        if(component?.changes.axes)
        {
            Logger.Log("left thumbstick axes: (" + component.axes.x + "," + component.axes.y + ")");
        }
    }

    private onRightTrigger(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("right trigger pressed");
            }
            else
            {
                Logger.Log("right trigger released");
            }
        }  
    }

    private onRightSqueeze(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("right squeeze pressed");
            }
            else
            {
                Logger.Log("right squeeze released");
            }
        }  
    }

    private onRightA(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("right A pressed");
            }
            else
            {
                Logger.Log("right A released");
            }
        }  
    }

    private onRightB(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("right B pressed");
            }
            else
            {
                Logger.Log("right B released");
            }
        }  
    }

    private onRightThumbstick(component?: WebXRControllerComponent)
    {  
        if(component?.changes.pressed)
        {
            if(component?.pressed)
            {
                Logger.Log("right thumbstick pressed");
            }
            else
            {
                Logger.Log("right thumbstick released");
            }
        }  

        if(component?.changes.axes)
        {
            Logger.Log("right thumbstick axes: (" + component.axes.x + "," + component.axes.y + ")");
        }

        // Forward locomotion, deadzone of 0.1
        if(component?.axes.y! > 0.1 || component?.axes.y! < -0.1)
        {
            // Get the current camera direction
            var directionVector = this.xrCamera!.getDirection(Axis.Z);

            // Use delta time to calculate the move distance based on speed of 3 m/sec
            var moveDistance = -component!.axes.y * (this.engine.getDeltaTime() / 1000) * 3;

            // Translate the camera forward
            this.xrCamera!.position.addInPlace(directionVector.scale(moveDistance));
        }

        // Turning, deadzone of 0.1
        if(component?.axes.x! > 0.1 || component?.axes.x! < -0.1)
        {
            // Use delta time to calculate the turn angle based on speed of 60 degrees/sec
            var turnAngle = component!.axes.x * (this.engine.getDeltaTime() / 1000) * 60;

            // Smooth turning
            var cameraRotation = Quaternion.FromEulerAngles(0, turnAngle * Math.PI / 180, 0);
            this.xrCamera!.rotationQuaternion.multiplyInPlace(cameraRotation);
        }
    } 

}
/******* End of the Game class ******/   

// start the game
var game = new Game();
game.start();