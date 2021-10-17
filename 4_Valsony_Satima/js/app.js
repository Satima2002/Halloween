/*
My WebGL App
*/
// Import modules
import * as THREE from './mods/three.module.js';
import Stats from './mods/stats.module.js';
import * as OBJLoader from './mods/OBJLoader.js';
import * as MTLLoader from './mods/MTLLoader.js';
import { GLTFLoader } from './mods/GLTFLoader.js';
import { OrbitControls } from './mods/OrbitControls.js';
import { GUI } from './mods/dat.gui.module.js';

// Global variables
let mainContainer = null;
let fpsContainer
let stats = null;
let camera = null;
let renderer = null;
let scene = null;
let plane = null;
let camControls = null;
let catloader=null;
const sceleton = new THREE.Group();
// const mixers = [];
let mixer = null;
let sceletonAnimation = null;
const clock = new THREE.Clock();

let ballAnimation = {
	direction: 1,
	posY: 10,
};


// sound
let sound = null;

let controlBoxParams = {
	soundOn: false,
	animShouldPlay: true,
	animDuration: 10,
	positionX: -8,
	rotationY: 0,
};

function init() {
	fpsContainer = document.querySelector('#fps');
	mainContainer = document.querySelector('#webgl-secne');
	scene = new THREE.Scene();

	let loader = new THREE.CubeTextureLoader();
	loader.setPath( 'img/cube2/' );
	const background = loader.load( [
        'grouse_ft.jpg', 'grouse_bk.jpg', 
        'grouse_up.jpg', 'grouse_dn.jpg',
        'grouse_rt.jpg','grouse_lf.jpg'
    ] );
	scene.background = background;

	const fogcolor = 0xffffff;  // white
	const fognear = 10;
	const fogfar = 20;
	const fogdensity = 0.01;
	scene.fog = new THREE.Fog(fogcolor, fognear, fogfar);
	scene.fog = new THREE.FogExp2(fogcolor, fogdensity);

	createStats();
	createCamera();
	createControls();
	createMeshes();
	createLights();
	createSound();
	createCtrlBox();
	createRenderer();
	renderer.setAnimationLoop(() => {
		update();
		render();
	});
}

// Animations
function update() {
	camControls.update(1);

	if (controlBoxParams.animShouldPlay == true) {
		const delta = clock.getDelta();
		// for (const mixer of mixers) {
		// 	mixer.update(delta);
		// }
		if (mixer != null) {
			mixer.update(delta);
		}
	}
	
	
}

// Statically rendered content
function render() {
	stats.begin();
	renderer.render(scene, camera);
	stats.end();
}

// FPS counter
function createStats() {
	stats = new Stats();
	stats.showPanel(0);	// 0: fps, 1: ms, 2: mb, 3+: custom
	fpsContainer.appendChild(stats.dom);
}

// Camera object
function createCamera() {
	const fov = 45;
	const aspect = mainContainer.clientWidth / mainContainer.clientHeight;
	const near = 0.1;
	const far = 500;	// meters
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.x = 10;
	camera.position.y = 20;
	camera.position.z = 100;

	let lookAtPosition = scene.position;
	// lookAtPosition.z = -100;
	camera.lookAt(lookAtPosition);
}

// Interactive controls
function createControls() {
	camControls = new OrbitControls(camera, mainContainer);
	camControls.autoRotate = false;
}

// Light objects
function createLights() {
	createDirectionalLight();
}
function createPlane(){
    const texture = new THREE.TextureLoader().load( "img/asphalt2.jpg" );
    // texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 16;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2,2);

    const planeGeometry = new THREE.PlaneBufferGeometry(40,40);
    const planeMaterial =  new THREE.MeshStandardMaterial({ map: texture });
    plane = new THREE.Mesh(planeGeometry,planeMaterial);
    plane.rotation.x = -0.5*Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = -20;
    plane.receiveShadow = true;
    scene.add(plane);
}

// Meshes and other visible objects
function createMeshes() {
	// const axes = new THREE.AxesHelper(10);
	// scene.add(axes);
	createHouse();
	createSceleton();
    createPlane(plane);
    createAlien();
    createCuteCat();
    createUVExample();
}

// Renderer object and features
function createRenderer() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	// choose shadow type
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
	mainContainer.appendChild(renderer.domElement);
}

function createDirectionalLight() {
	const dirLight = new THREE.DirectionalLight(0xffffff, 1, 100); // color, intensity, proximity
	dirLight.position.set(-10, 10, 20);
	// makes the shadows with less blurry edges
	dirLight.shadow.mapSize.width = 1048;  	// default
	dirLight.shadow.mapSize.height = 1048; 	// default
	// set light coverage
	dirLight.shadow.camera.near = 0.5;      // default
	dirLight.shadow.camera.far = 50;      	// default
	dirLight.shadow.camera.left = -80;
	dirLight.shadow.camera.top = 35;
	dirLight.shadow.camera.right = 80;
	dirLight.shadow.camera.bottom = -35;
	// enable shadows for light source
	dirLight.castShadow = true;
	scene.add(dirLight);

	// adds helping lines
	// const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 3, 0xcc0000);
	// scene.add(dirLightHelper);
	// scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}


function createHouse(){
	const loader = new GLTFLoader();
loader.load(
    'models/house/scene.gltf',
    ( gltf ) => {
        // called when the resource is loaded
        gltf.scene.scale.set(2.5,2.5,2.5);
        gltf.scene.position.x=4;
        gltf.scene.position.z=6;
       
        gltf.scene.traverse( function( child ){ child.castShadow = true; } );
        gltf.scene.traverse( function( child ){ child.receiveShadow = true; } );
        scene.add( gltf.scene );
    },
    ( xhr ) => {
        // called while loading is progressing
        console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
    },
    ( error ) => {
        // called when loading has errors
        console.error( 'An error happened', error );
    },
);
}
function createAlien(){
    const loader = new GLTFLoader();
loader.load(
    'models/alien/scene.gltf',
    ( gltf ) => {
        // called when the resource is loaded
        gltf.scene.scale.set(1.2,1.2,1.2);
        gltf.scene.position.x=-5;
        gltf.scene.position.z=-6;
        gltf.scene.position.y=2;
        gltf.scene.traverse( function( child ){ child.castShadow = true; } );
       // gltf.scene.traverse( function( child ){ child.receiveShadow = true; } );
        scene.add( gltf.scene );
    },
    ( xhr ) => {
        // called while loading is progressing
        console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
    },
    ( error ) => {
        // called when loading has errors
        console.error( 'An error happened', error );
    },
);
}
function createCuteCat(){
    catloader = new GLTFLoader();
catloader.load(
    'models/cat/scene.gltf',
    ( gltf ) => {
        // called when the resource is loaded
		gltf.scene.scale.set(0.02,0.02,0.02);
        gltf.scene.position.x=6;
        gltf.scene.position.z=-6;
		gltf.scene.position.y=2;
		animation();
		function animation() {
			//gltf.scene.position.z+= 0.1;
			if (ballAnimation.direction == 1) {
                ballAnimation.posY += 0.1;
        } else  {
                ballAnimation.posY -= 0.1;
        }

        if (ballAnimation.posY >= 20.0) {
                ballAnimation.direction = 0;
        } else if (ballAnimation.posY <= 5.0) {
                ballAnimation.direction = 1;
        }
        gltf.scene.position.x = ballAnimation.posY;
        //ballMesh.rotation.y+=0.05;
			//gltf.scene.position.z-=0.1;
			//gltf.scene.position.x-=0.1;

			renderer.render(scene,camera);
			requestAnimationFrame(function () {
				animation();
			})
		}
        gltf.scene.traverse( function( child ){ child.castShadow = true; } );
       // gltf.scene.traverse( function( child ){ child.receiveShadow = true; } );
        scene.add( gltf.scene );
    },
    ( xhr ) => {
        // called while loading is progressing
        console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
    },
    ( error ) => {
        // called when loading has errors
        console.error( 'An error happened', error );
    },
);
}


function createSceleton() {
	const loader = new GLTFLoader();
	const onLoad = (gltf, position, scale) => {
		const model = gltf.scene.children[0];
		model.traverse(function (child) {
			if (child instanceof THREE.Mesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		model.position.copy(position);
		model.scale.set(scale, scale, scale)
		sceletonAnimation = gltf.animations[0];
		mixer = new THREE.AnimationMixer(model);
		// mixers.push(mixer);
		const action = mixer.clipAction(sceletonAnimation);
		action.setDuration(10);
		action.play();
		sceleton.add(model);
	};
	const onProgress = () => { };
	const onError = (errorMessage) => { console.log(errorMessage); };

	const modelPosition = new THREE.Vector3(0, 1, -5);
	const modelScale = 1.2;
	loader.load('models/sceleton/scene.gltf', gltf => onLoad(gltf, modelPosition, modelScale), onProgress, onError);
	sceleton.rotation.y = Math.PI*2;
	scene.add(sceleton);
}

function createUVExample() {
	const texture = new THREE.TextureLoader().load("img/knitting.jpg");
	texture.anisotropy = 16;

	const sphereGeometry = new THREE.SphereGeometry();
	const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
	let knitting = new THREE.Mesh(sphereGeometry, sphereMaterial);
	
	knitting.position.x = 8;
	knitting.position.y = 1;
	knitting.position.z = -3;
	knitting.castShadow = true;
	scene.add(knitting);
}
function createSound() {
	let listener = new THREE.AudioListener();
	camera.add(listener);

	// create a global audio source
	sound = new THREE.Audio(listener);
	// load a sound and set it as the Audio object's buffer
	let audioLoader = new THREE.AudioLoader();
	audioLoader.load('sounds/Loyalty_Freak_Music_-_04_-_Hello_Regan_.mp3', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setVolume(0.8);
		// sound.play();
	});
}

// Create check box for enabling/disabling sound
function createCtrlBox() {
	const gui = new GUI();
	gui.remember(controlBoxParams);
	let sb = gui.add(controlBoxParams, 'soundOn').name('Sound On/Off');
	sb.listen();
	sb.onChange(function (value) {
		if (value == true) {
			sound.play();
		} else {
			sound.stop()
		};
	});
    
	let ctrlAnimCanPlay = gui.add(controlBoxParams, "animShouldPlay").name("Animation On/Off");
	ctrlAnimCanPlay.listen();
	ctrlAnimCanPlay.onChange(function (value) {
		console.log("animShouldPlay: ", value)
    });
    

	let ctrlAnimDuration = gui.add(controlBoxParams, 'animDuration').min(1).max(30).step(2).name('Duration');
	ctrlAnimDuration.listen();	
	ctrlAnimDuration.onChange(function(value) {
		const action = mixer.clipAction(sceletonAnimation);
		action.setDuration(value);
		action.play();
	});
	
	
	let ctrlPosZ = gui.add(controlBoxParams, 'positionX').min(-18).max(18).step(1).name('Position Z');
	ctrlPosZ.listen();	
	ctrlPosZ.onChange(function(value) {
		sceleton.position.z = value;
	});
	
}


// Auto resize window
window.addEventListener('resize', e => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

init();