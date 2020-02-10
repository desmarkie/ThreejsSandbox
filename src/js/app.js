import * as THREE from 'three';

import MouseInput from './utils/mouseInput.js';

import FullscreenQuad from './sketches/fullscreenquad.js';
import Chasers from './sketches/chasers.js';


export default class App
{

	constructor()
	{

		// sketch selection
		this.sketches = [
			FullscreenQuad,
			Chasers
		];

		var urlParms = new URLSearchParams( window.location.search );
		this.selection = urlParms.get( 'sketch' ) | 0;
		if( this.selection >= this.sketches.length ) this.selection = this.sketches.length - 1;

		// three init
		this.mouse = new MouseInput( window.innerWidth / 4, window.innerHeight / 2 );

		this.scene = new THREE.Scene();
	
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 60;
		
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		this.createSketch();

		// events
		window.onresize = this.handleResize.bind( this );

		requestAnimationFrame( this.update.bind( this ) );

	}

	handleResize()
	{

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.sketch.handleResize();

	}

	createSketch()
	{

		this.sketch = new this.sketches[ this.selection ];
		this.scene.add( this.sketch );

	}

	update()
	{

		this.sketch.update( this.mouse );

		this.renderer.render( this.scene, this.camera );

		requestAnimationFrame( this.update.bind( this ) );

	}

}

