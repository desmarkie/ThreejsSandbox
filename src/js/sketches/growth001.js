import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

import ComputeShaderGrowth from '../../shaders/growth_001_csgrow.fs';
import ComputeShaderUpdate from '../../shaders/growth_001_csupdate.fs';
import ComputeShaderPosition from '../../shaders/growth_001_cspos.fs';
import GrowthFS from '../../shaders/growth_001_outfs.fs';
import GrowthVS from '../../shaders/growth_001_outvs.vs';

import GPGPULineBufferGeometry from '../utils/gpgpulinebuffergeometry.js'

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

		this.boxSize = 24;

		// Texture width for simulation (each texel is a debris particle)
		this.textureWidth = ( isIE || isEdge ) ? 4 : 128;
		this.pointScale = 0.65;

		this.points = this.textureWidth * this.textureWidth;

		this.initPoints();

		this.initGeometry();

	}

	initPoints()
	{

		this.gpuCompute = new GPUComputationRenderer( this.textureWidth, this.textureWidth, this.renderer );

		var posTexture = this.gpuCompute.createTexture();
		var tgtTexture = this.gpuCompute.createTexture();
		var statTexture = this.gpuCompute.createTexture();

		this.fillTextures( posTexture, tgtTexture, statTexture );

		this.groVar = this.gpuCompute.addVariable( 'textureTarget', ComputeShaderGrowth, tgtTexture );
		this.statVar = this.gpuCompute.addVariable( 'textureStatus', ComputeShaderUpdate, statTexture );
		this.posVar = this.gpuCompute.addVariable( 'texturePosition', ComputeShaderPosition, posTexture );
		

		this.gpuCompute.setVariableDependencies( this.groVar, [ this.posVar, this.statVar, this.groVar ] );
		this.gpuCompute.setVariableDependencies( this.statVar, [ this.posVar, this.statVar, this.groVar ] );
		this.gpuCompute.setVariableDependencies( this.posVar, [ this.posVar, this.statVar, this.groVar ] );

		var error = this.gpuCompute.init();

		if( error != null )
		{
			console.warn( error );
		}

	}

	initGeometry()
	{

		var geo = new GPGPULineBufferGeometry( this.textureWidth );

		this.lineUniforms = {
			'texturePosition': { value: null },
			'textureTarget': { value: null }
		}

		var mat = new THREE.ShaderMaterial({
			uniforms: this.lineUniforms,
			vertexShader: GrowthVS,
			fragmentShader: GrowthFS
		});

		var lines = new THREE.Mesh( geo, mat );
		lines.matrixAutoUpdate = false;
		lines.updateMatrix();

		this.add( lines );

	}

	fillTextures( posTex, tgtTex, statTex )
	{

		var posArr = posTex.image.data;
		var tgtArr = tgtTex.image.data;
		var statArr = statTex.image.data;

		var spread = this.boxSize / 2;

		var startPoint = Math.floor( Math.random() * this.points );

		for( var i = 0; i < posArr.length; i += 4 )
		{

			// rgb
			// random points in a cube ( sorta, but lazily )
			posArr[ i ] 	= -spread + Math.random() * spread;
			posArr[ i + 1 ] = -spread + Math.random() * spread;
			posArr[ i + 2 ] = -spread + Math.random() * spread;
			// a
			// point is used
			posArr[ i + 3 ] = 0;

			// rgb
			// target pos is aloways 0
			tgtArr[ i ] 	= 0;
			tgtArr[ i + 1 ] = 0;
			tgtArr[ i + 2 ] = 0;
			// a
			// point is active
			tgtArr[ i + 3 ] = 0;

			// point status
			statArr[ i ] 	 = i == startPoint ? 1 : 0; // point is active
			statArr[ i + 1 ] = i == startPoint ? 1 : 0; // point is used
			statArr[ i + 2 ] = 0;
			statArr[ i + 3 ] = 0;

			// set start point active and used
			if( i == startPoint )
			{
				posArr[ i + 3 ] = 1;
				tgtArr[ i + 3 ] = 1;
			}

		}

	}

	update( mouse )
	{

	}

	handleResize()
	{

	}

}
