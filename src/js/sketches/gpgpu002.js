import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

import ComputeShaderVelocity from '../../shaders/gpgpu001_csvel.fs';
import ComputeShaderPosition from '../../shaders/gpgpu001_cspos.fs';
import ParticleVS from '../../shaders/gpugpu002_partvs.vs';
import ParticleFS from '../../shaders/gpugpu002_partfs.fs';

import GPGPUQuadBufferGeometry from '../utils/gpgpuquadbuffergeometry.js'

export default class GPGPU002 extends THREE.Object3D
{

	constructor( camera, renderer )
	{

		super();

		this.camera = camera;
		this.renderer = renderer;

		this.controls = new OrbitControls( camera, this.renderer.domElement );

		var isIE = /Trident/i.test( navigator.userAgent );
		var isEdge = /Edge/i.test( navigator.userAgent );

		// Texture width for simulation (each texel is a debris particle)
		this.textureWidth = ( isIE || isEdge ) ? 4 : 128;
		this.pointScale = 0.65;

		this.points = this.textureWidth * this.textureWidth;

		this.initCompute();

		// particle_001.png
		var loader = new THREE.TextureLoader();
		this.particleTexture = loader.load( 
			
			'assets/textures/particle_001.png'

		);

		this.initParticles( camera );

	}

	

	initCompute()
	{

		this.gpuCompute = new GPUComputationRenderer( this.textureWidth, this.textureWidth, this.renderer );

		var dtPosition = this.gpuCompute.createTexture();
		var dtVelocity = this.gpuCompute.createTexture();

		this.fillTextures( dtPosition, dtVelocity );

		this.velVar = this.gpuCompute.addVariable( 'textureVelocity', ComputeShaderVelocity, dtVelocity );
		this.posVar = this.gpuCompute.addVariable( 'texturePosition', ComputeShaderPosition, dtPosition );

		this.gpuCompute.setVariableDependencies( this.velVar, [ this.posVar, this.velVar ] );
		this.gpuCompute.setVariableDependencies( this.posVar, [ this.posVar, this.velVar ] );

		this.velUniforms = this.velVar.material.uniforms;

		this.velUniforms[ 'gravity' ] = { value: 0.0 };
		this.velUniforms[ 'mousePosition' ] = { value: new THREE.Vector3() };

		var error = this.gpuCompute.init();

		if( error != null )
		{
			console.warn( error );
		}

	}

	initParticles( camera )
	{

		var geometry = new GPGPUQuadBufferGeometry( this.textureWidth );

		this.quadUniforms = {
			'texturePosition': { value: null },
			'textureVelocity': { value: null },
			'cameraConstant': { value: this.getCameraConstant( camera ) },
			'time': { value: 0 },
			'map': this.particleTexture,
			'pointScale': { value: this.pointScale }
		};

		var material = new THREE.ShaderMaterial({
			uniforms: this.quadUniforms,
			vertexShader: ParticleVS,
			fragmentShader: ParticleFS,
			depthWrite: false,
			transparent: true
		});

		//material.extensions.drawBuffers = true;

		var quads = new THREE.Mesh( geometry, material );
		quads.matrixAutoUpdate = false;
		quads.updateMatrix();

		this.add( quads );

	}

	fillTextures( posTex, velTex )
	{

		var posArr = posTex.image.data;
		var velArr = velTex.image.data;

		var rad = 18.0;

		for( var k = 0; k < posArr.length; k += 4 )
		{

			// pos
			var i = Math.floor( k / 4 );
			var x = ( ( i % this.textureWidth ) / this.textureWidth ) * rad;
			var y = ( Math.floor( i / this.textureWidth ) / this.textureWidth ) * rad;
			var z = 0;
			
			x -= this.textureWidth / 60.0;
			y -= this.textureWidth / 60.0;

			posArr[ k ] 	= x;
			posArr[ k + 1 ] = y;
			posArr[ k + 2 ] = z;
			posArr[ k + 3 ] = Math.random();

			velArr[ k ] 	= 0;
			velArr[ k + 1 ] = 0;
			velArr[ k + 2 ] = 0;
			velArr[ k + 3 ] = Math.random();

		}

	}

	getCameraConstant( camera ) 
	{

		return window.innerHeight / ( Math.tan( THREE.MathUtils.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );

	}

	update( mouse )
	{

		this.velUniforms[ 'mousePosition' ].value = mouse.mouseToZPlane;

		this.gpuCompute.compute();

		this.quadUniforms[ "texturePosition" ].value = this.gpuCompute.getCurrentRenderTarget( this.posVar ).texture;
		this.quadUniforms[ "textureVelocity" ].value = this.gpuCompute.getCurrentRenderTarget( this.velVar ).texture;
		this.quadUniforms[ "time" ].value = performance.now();

	}

	handleResize()
	{

	}

}