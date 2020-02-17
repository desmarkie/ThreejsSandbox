import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

import ComputeShaderVelocity from '../../shaders/gpgpu001_csvel.fs';
import ComputeShaderPosition from '../../shaders/gpgpu001_cspos.fs';
import ParticleVS from '../../shaders/gpugpu001_partvs.vs';
import ParticleFS from '../../shaders/gpugpu001_partfs.fs';

export default class GPGPU001 extends THREE.Object3D
{
	//https://github.com/mrdoob/three.js/blob/master/examples/webgl_gpgpu_protoplanet.html

	constructor( camera, renderer )
	{
		super();

		this.renderer = renderer;
		

		this.controls = new OrbitControls( camera, this.renderer.domElement );

		var isIE = /Trident/i.test( navigator.userAgent );
		var isEdge = /Edge/i.test( navigator.userAgent );

		// Texture width for simulation (each texel is a debris particle)
		this.textureWidth = ( isIE || isEdge ) ? 4 : 256;

		this.points = this.textureWidth * this.textureWidth;

		this.initCompute();

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

		this.geometry = new THREE.BufferGeometry();

		var positions = new Float32Array( this.points * 3 );
		var p = 0;

		for( var i = 0; i < this.points; i++ )
		{

			positions[ p ] 	   = ( i % this.textureWidth ) / this.textureWidth;
			positions[ p + 1 ] = ( i / this.textureWidth ) / this.textureWidth;
			positions[ p + 2 ] = 0;

			p += 3;

		}

		var uvs = new Float32Array( this.points * 2 );
		p = 0;

		for( var j = 0; j < this.textureWidth; j++ )
		{

			for( var i = 0; i < this.textureWidth; i++ )
			{

				uvs[ p ] 	 = i / ( this.textureWidth - 1 );
				uvs[ p + 1 ] = j / ( this.textureWidth - 1 );

				p += 2
				
			}

		}

		this.geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		this.geometry.setAttribute( 'uv', new THREE.BufferAttribute( uvs, 2 ) );

		this.particleUniforms = {
			'texturePosition': { value: null },
			'textureVelocity': { value: null },
			'cameraConstant': { value: this.getCameraConstant( camera ) },
			'time': { value: 0 }
		};

		var material = new THREE.ShaderMaterial({
			uniforms: this.particleUniforms,
			vertexShader: ParticleVS,
			fragmentShader: ParticleFS
		});

		material.extensions.drawBuffers = true;

		var particles = new THREE.Points( this.geometry, material );
		particles.matrixAutoUpdate = false;
		particles.updateMatrix();

		this.add( particles );

	}

	fillTextures( posTex, velTex )
	{

		var posArr = posTex.image.data;
		var velArr = velTex.image.data;

		var rad = 18.0;

		for( var k = 0; k < posArr.length; k += 4 )
		{

			// pos
			var i = k / 4;
			var x = ( ( i % this.textureWidth ) / this.textureWidth ) * rad;
			var y = ( ( i / this.textureWidth ) / this.textureWidth ) * rad;
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

			k += 4;

		}

	}

	getCameraConstant( camera ) 
	{

		return window.innerHeight / ( Math.tan( THREE.MathUtils.DEG2RAD * 0.5 * camera.fov ) / camera.zoom );

	}

	handleResize()
	{

	}

	update( mouse )
	{

		this.velUniforms[ 'mousePosition' ].value = mouse.mouseToZPlane;

		this.gpuCompute.compute();

		this.particleUniforms[ "texturePosition" ].value = this.gpuCompute.getCurrentRenderTarget( this.posVar ).texture;
		this.particleUniforms[ "textureVelocity" ].value = this.gpuCompute.getCurrentRenderTarget( this.velVar ).texture;
		this.particleUniforms[ "time" ].value = performance.now();

	}

}