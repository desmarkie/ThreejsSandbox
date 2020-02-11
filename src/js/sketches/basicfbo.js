import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import simVS from '../../shaders/basic_fbo_sim_vs.vs';
import simFS from '../../shaders/basic_fbo_sim_fs.fs';
import renVS from '../../shaders/basic_fbo_ren_vs.vs';
import renFS from '../../shaders/basic_fbo_ren_fs.fs';

export default class BasicFBO extends THREE.Object3D
{

	constructor( camera, renderer )
	{
		super();

		// https://stackoverflow.com/a/56159080

		this.renderer = renderer;
		camera.position.set( -0.5, -0.5, 5.0 );

		this.controls = new OrbitControls( camera, this.renderer.domElement );

		// set initial positions of `w*h` particles
		this.w = 256;
		this.h = 256;
		var i = 0;
		var data = new Float32Array( this.w * this.h * 3 );
		for( var x = 0; x < this.w; x++ ) 
		{ 
			for( var y = 0; y < this.h; y++ ) 
			{
				data[ i ] 	  = ( x / this.w ) * 1.1;
				data[ i + 1 ] = ( y / this.h ) * 1.1;
				data[ i + 2 ] = 0;

				i += 3;
			}
		}

		// feed those positions into a data texture
		var dataTex = new THREE.DataTexture(data, this.w, this.h, THREE.RGBFormat, THREE.FloatType);
		dataTex.minFilter = THREE.NearestFilter;
		dataTex.magFilter = THREE.NearestFilter;
		dataTex.needsUpdate = true;

		// add the data texture with positions to a material for the simulation
		this.simMaterial = new THREE.RawShaderMaterial({
			uniforms: { 
				posTex: { type: 't', value: dataTex }, 
				time: { type: 'f', value: 0 } 
			},
			vertexShader: simVS,
			fragmentShader: simFS
		});

		// delete dataTex; it isn't used after initializing point positions
		dataTex = null;

		var FBO = function( w, simMat ) 
		{
			this.scene = new THREE.Scene();
			this.camera = new THREE.OrthographicCamera( -w / 2, w / 2, w / 2, -w / 2, -1, 1 );
			this.scene.add( new THREE.Mesh( new THREE.PlaneGeometry( w, w ), simMat ) );
		};

		// create a scene where we'll render the positional attributes
		this.fbo = new FBO( this.w, this.simMaterial );

		// create render targets a + b to which the simulation will be rendered
		this.renderTargetA = new THREE.WebGLRenderTarget( this.w, this.h, {
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.RepeatWrapping,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBFormat,
			type: THREE.FloatType,
			stencilBuffer: false,
		});

		// a second render target lets us store input + output positional states
		this.renderTargetB = this.renderTargetA.clone();

		// render the positions to the render targets
		this.renderer.setRenderTarget( this.renderTargetA );
		this.renderer.render( this.fbo.scene, this.fbo.camera );
		this.renderer.setRenderTarget( this.renderTargetB );
		this.renderer.render( this.fbo.scene, this.fbo.camera );

		this.renderer.setRenderTarget( null );

		// store the uv attrs; each is x,y and identifies a given point's
		// position data within the positional texture; must be scaled 0:1!
		this.geo = new THREE.BufferGeometry();
		this.arr = new Float32Array( this.w * this.h * 3 );
		for( i = 0; i < this.arr.length; i += 3 ) 
		{
			this.arr[ i ] 	= ( i % this.w ) / this.w;
			this.arr[ i + 1 ] = Math.floor( i / this.w ) / this.h;
			this.arr[ i + 2 ] = 0;
		}
		this.geo.setAttribute( 'position', new THREE.BufferAttribute( this.arr, 3, true ) )

		// create material the user sees
		this.material = new THREE.RawShaderMaterial({
			uniforms: {
				posMap: { type: 't', value: null }, // `posMap` is set each render
			},
			vertexShader: renVS,
			fragmentShader: renFS,
			transparent: true
		});

		// add the points the user sees to the scene
		this.mesh = new THREE.Points( this.geo, this.material );
		this.add( this.mesh );

	}

	handleResize()
	{

	}

	update()
	{

		// at the start of the render block, A is one frame behind B
		var oldA = this.renderTargetA; // store A, the penultimate state
		this.renderTargetA = this.renderTargetB; // advance A to the updated state
		this.renderTargetB = oldA; // set B to the penultimate state

		// pass the updated positional values to the simulation
		this.simMaterial.uniforms.time.value = performance.now() / 1000.0;
		this.simMaterial.uniforms.posTex.value = this.renderTargetA.texture;

		// run a frame and store the new positional values in renderTargetB
		this.renderer.setRenderTarget( this.renderTargetB );
		this.renderer.render( this.fbo.scene, this.fbo.camera );

		// pass the new positional values to the scene users see
		this.material.uniforms.posMap.value = this.renderTargetB.texture;

		this.renderer.setRenderTarget( null );


	}

}

BasicFBO.needsFBO = true;