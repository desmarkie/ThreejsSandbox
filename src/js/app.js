import fsQuadVert from '../shaders/fullscreen_quad.vs';
import fsQuadFrag from '../shaders/fullscreen_quad.fs';

import MouseInput from 'mouseInput.js';


export default class App
{

	constructor()
	{

		console.log( MouseInput );
		
		this.mouse = new MouseInput();

		this.scene = new THREE.Scene();
	
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 1.2;
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		this.createGeo();
		this.createLights();

		window.onresize = this.handleResize.bind( this );

		requestAnimationFrame( this.update.bind( this ) );

	}

	

	handleResize( evt )
	{

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.quadMaterial.uniforms.resolution.value.x = window.innerWidth;
		this.quadMaterial.uniforms.resolution.value.y = window.innerHeight;

	}

	createLights()
	{

		this.dirLightTarget = new THREE.Object3D();
		this.scene.add( this.dirLightTarget );

		this.dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		this.dirLight.target = this.dirLightTarget;
		this.scene.add( this.dirLight );

	}

	createGeo()
	{
		
		this.quadGeo = new THREE.PlaneGeometry( 2, 2 );
		this.quadGeo.faceVertexUvs[0] = [];
		this.quadGeo.faceVertexUvs[0][0] = [
			new THREE.Vector2( 0, 0 ),
			new THREE.Vector2( 1, 0 ),
			new THREE.Vector2( 0, 1 )
		];
		this.quadGeo.faceVertexUvs[0][1] = [
			new THREE.Vector2( 1, 0 ),
			new THREE.Vector2( 1, 1 ),
			new THREE.Vector2( 0, 1 )
		];

		this.uniforms = {
			time: { type: 'f', value: 0.0 },
			multi: { type: 'f', value: 5.0 },
			resolution: { type: 'v2', value: new THREE.Vector2( this.renderer.domElement.width, this.renderer.domElement.height ) },
			mouse: { type: 'v2', value: new THREE.Vector2() }
		};

		this.quadMaterial = new THREE.ShaderMaterial({
			uniforms: this.uniforms, 
			vertexShader: fsQuadVert, 
			fragmentShader: fsQuadFrag,
			depthWrite: false,
			depthTest: false
		});
		
		this.quad = new THREE.Mesh( this.quadGeo, this.quadMaterial );
		this.scene.add( this.quad );

	}

	update()
	{

		var time = performance.now() / 1000;
		this.quadMaterial.uniforms.time.value = time;
		this.quadMaterial.uniforms.multi.value = ( this.mouse.x / window.innerWidth ) * 150.0;

		this.quadMatrial.uniforms.mouse.value.x = this.mouse.x;
		this.quadMatrial.uniforms.mouse.value.y = this.mouse.y;

		this.renderer.render( this.scene, this.camera );

		requestAnimationFrame( this.update.bind( this ) );

	}

}

