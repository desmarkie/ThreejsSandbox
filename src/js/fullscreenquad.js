import * as THREE from 'three';

import fsQuadVert from '../shaders/fullscreen_quad.vs';
import fsQuadFrag from '../shaders/fullscreen_quad.fs';


export default class FullscreenQuad extends THREE.Object3D
{

	constructor( mouse )
	{

		super();

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
			resolution: { type: 'v2', value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
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
		this.add( this.quad );

	}

	update( mouse )
	{

		if( !mouse ) mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

		var time = performance.now() / 1000;
		this.quadMaterial.uniforms.time.value = time;
		this.quadMaterial.uniforms.multi.value = ( mouse.x / window.innerWidth ) * 150.0;

		this.quadMaterial.uniforms.mouse.value.x = mouse.x;
		this.quadMaterial.uniforms.mouse.value.y = mouse.y;

	}

	handleResize()
	{

		this.quadMaterial.uniforms.resolution.value.x = window.innerWidth;
		this.quadMaterial.uniforms.resolution.value.y = window.innerHeight;

	}

}