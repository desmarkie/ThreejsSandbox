
var scene, camera, renderer;
var dirLightTarget, dirLight;

var quad, quadMaterial, quadGeo;
var uniforms;

var mousePos = {
	x: 0, 
	y: 0
};

var vert = `

	varying vec2 vUv;

	void main() 
	{

		vUv = uv;

		// general MVP for geometry
		//vec4 modelViewPosition = modelViewMatrix * vec4( position, 1.0 );
		//gl_Position = projectionMatrix * modelViewPosition;

		// fullscreen quad
		gl_Position = vec4( position, 1.0 );

	}
`;

var frag = `

	varying vec2 vUv;

	uniform float time;
	uniform float multi;
	uniform vec2 mouse;
	uniform vec2 resolution;

	void main()
	{

		// normalize and center UVs
		vec2 st = vUv;
		st -= 0.5;
		st.y *= resolution.x / resolution.y;
		st += 0.5;

		float val = abs(sin( sin( time / 3.0 ) * multi+ ( distance( st, vec2( 0.5 ) ) * multi ) ) );
		gl_FragColor = vec4( vec3( val ), 1.0 );

	}
`;

function init()
{

	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
	camera.position.z = 1.2;
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	document.onmousemove = handleMouseMove;

	createGeo();
	createLights();

	window.onresize = handleResize;

	requestAnimationFrame( update );

}

function handleResize( e )
{
	
	renderer.setSize( window.innerWidth, window.innerHeight );
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	quad.material.uniforms.resolution.value.x = window.innerWidth;
	quad.material.uniforms.resolution.value.y = window.innerHeight;

}

function handleMouseMove( e )
{

	var evt = e || window.event;
	mousePos.x = e.pageX;
	mousePos.y = e.pageY;

	quad.material.uniforms.mouse.value.x = mousePos.x;
	quad.material.uniforms.mouse.value.y = mousePos.y;

}

function createLights()
{

	dirLightTarget = new THREE.Object3D();
	scene.add( dirLightTarget );

	dirLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	dirLight.target = dirLightTarget;
	scene.add( dirLight );

}

function createGeo()
{
	
	quadGeo = new THREE.PlaneGeometry( 2, 2 );
	quadGeo.faceVertexUvs[0] = [];
	quadGeo.faceVertexUvs[0][0] = [
		new THREE.Vector2( 0, 0 ),
		new THREE.Vector2( 1, 0 ),
		new THREE.Vector2( 0, 1 )
	];
	quadGeo.faceVertexUvs[0][1] = [
		new THREE.Vector2( 1, 0 ),
		new THREE.Vector2( 1, 1 ),
		new THREE.Vector2( 0, 1 )
	];

	uniforms = {
		time: { type: 'f', value: 0.0 },
		multi: { type: 'f', value: 5.0 },
		resolution: { type: 'v2', value: new THREE.Vector2( renderer.domElement.width, renderer.domElement.height ) },
		mouse: { type: 'v2', value: new THREE.Vector2() }
	};

	quadMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms, 
		vertexShader:vert, 
		fragmentShader:frag,
		depthWrite: false,
		depthTest: false
	});
	
	quad = new THREE.Mesh( quadGeo, quadMaterial );
	scene.add( quad );

}

function update()
{

	var time = performance.now() / 1000;
	quad.material.uniforms.time.value = time;
	quad.material.uniforms.multi.value = ( mousePos.x / window.innerWidth ) * 150.0;

	renderer.render( scene, camera );

	requestAnimationFrame( update );

}

window.onload = init;
