import * as THREE from 'three';

import MouseInput from './mouseInput.js';

import FullscreenQuad from './fullscreenquad.js';
import Chasers from './chasers.js';


export default class App
{

	constructor()
	{

		this.mouse = new MouseInput( window.innerWidth / 4, window.innerHeight / 2 );

		this.scene = new THREE.Scene();
	
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 60;
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		this.createGeo();
		this.createLights();

		window.onresize = this.handleResize.bind( this );

		requestAnimationFrame( this.update.bind( this ) );

	}

	

	handleResize()
	{

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		if( this.quad )
		{
			this.quad.handleResize();
		}

		if( this.chasers )
		{
			this.chasers.handleResize();
		}

	}

	createLights()
	{

		this.dirLightTarget = new THREE.Object3D();
		this.scene.add( this.dirLightTarget );

		this.dirLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
		this.dirLight.target = this.dirLightTarget;
		this.dirLight.position.set( 16, 12, 10 );
		this.dirLight.castShadow = true;
		this.dirLight.shadow.mapSize.width = 512;
		this.dirLight.shadow.mapSize.height = 512;
		this.dirLight.shadow.camera.near = 0.5;
		this.dirLight.shadow.camera.far = 100;
		this.scene.add( this.dirLight );

		this.pointLightA = new THREE.PointLight( 0xf5c542, 1.5, 50 );
		this.pointLightA.position.set( -20, -10, 0 );
		this.scene.add( this.pointLightA );

		this.pointLightB = new THREE.PointLight( 0x85f5ff, 3, 50 );
		this.pointLightB.position.set( 20, 15, 2 );
		this.scene.add( this.pointLightB );

	}

	createGeo()
	{

		this.chasers = new Chasers();
		this.scene.add( this.chasers );
		
		//this.quad = new FullscreenQuad();
		//this.scene.add( this.quad );

	}

	update()
	{

		if( this.quad )
		{
			this.quad.update( this.mouse );
		}

		if( this.chasers )
		{
			this.chasers.update( this.mouse );
		}

		this.renderer.render( this.scene, this.camera );

		requestAnimationFrame( this.update.bind( this ) );

	}

}

