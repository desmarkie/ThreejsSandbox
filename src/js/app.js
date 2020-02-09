import fsQuadVert from '../shaders/fullscreen_quad.vs';
import fsQuadFrag from '../shaders/fullscreen_quad.fs';

export default class App
{

	constructor()
	{
		
		this.mousePos = {
			x: 0,
			y: 0
		};

		this.scene = new THREE.Scene();
	
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 1.2;
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		document.onmousemove = this.handleMouseMove.bind( this );

		this.createGeo();
		this.createLights();

		window.onresize = this.handleResize.bind( this );

		requestAnimationFrame( this.update.bind( this ) );

	}

	handleMouseMove( evt )
	{

		this.mousePos.x = evt.pageX;
		this.mousePos.y = evt.pageY;

		this.quad.material.uniforms.mouse.value.x = this.mousePos.x;
		this.quad.material.uniforms.mouse.value.y = this.mousePos.y;

	}

	handleResize( evt )
	{

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.quad.material.uniforms.resolution.value.x = window.innerWidth;
		this.quad.material.uniforms.resolution.value.y = window.innerHeight;

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
		this.quad.material.uniforms.time.value = time;
		this.quad.material.uniforms.multi.value = ( this.mousePos.x / window.innerWidth ) * 150.0;

		this.renderer.render( this.scene, this.camera );

		requestAnimationFrame( this.update.bind( this ) );

	}

}

