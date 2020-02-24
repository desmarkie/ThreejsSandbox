import * as THREE from 'three';

import MouseInput from './utils/mouseInput.js';
import SketchSelection from './utils/sketchselection.js';

import FullscreenQuad from './sketches/fullscreenquad.js';
import Chasers from './sketches/chasers.js';
import BasicFBO from './sketches/basicfbo.js';
import GPGPU001 from './sketches/gpgpu001.js';
import GPGPU002 from './sketches/gpgpu002.js';
import Growth001 from './sketches/growth001.js';

export default class App
{

	constructor()
	{

		// sketch selection
		this.sketches = [
			FullscreenQuad,
			Chasers,
			BasicFBO,
			GPGPU001,
			GPGPU002,
			Growth001
		];

		this.sketchSelection = new SketchSelection( this.sketches );

		var urlParms = new URLSearchParams( window.location.search );
		this.selection = urlParms.get( 'sketch' ) || this.sketches.length - 1;
		if( this.selection >= this.sketches.length ) this.selection = this.sketches.length - 1;

		// three init
		this.mouse = new MouseInput( window.innerWidth / 4, window.innerHeight / 2 );

		this.scene = new THREE.Scene();
	
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
		this.camera.position.z = 60;
		
		this.renderer = new THREE.WebGLRenderer({ antiAlias: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		this.createSketch();

		// this.addMouseDebug();

		// events
		window.onresize = this.handleResize.bind( this );

		requestAnimationFrame( this.update.bind( this ) );

	}

	handleResize()
	{

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		if( this.sketch ) this.sketch.handleResize();

	}

	createSketch()
	{

		var sketchName = this.sketches[ this.selection ];
		if( sketchName.needsFBO && !this.canUseFBO() )
		{
			console.warn("FBO CHECK FAILED");
			return;
		}

		this.sketch = new sketchName( this.camera, this.renderer );
		this.scene.add( this.sketch );

	}

	canUseFBO()
	{
		var gl = this.renderer.getContext();
		if (!gl.getExtension('OES_texture_float') ||
		     gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
		  return false;
		}
		return true;
	}

	update()
	{

		this.mouse.mouseToZPlane = this.projectMouseToZPlane();


		if( this.sketch ) this.sketch.update( this.mouse );

		if( this.mouseDebug ) this.mouseDebug.position.copy( this.mouse.mouseToZPlane );

		this.renderer.render( this.scene, this.camera );

		requestAnimationFrame( this.update.bind( this ) );

	}

	// https://stackoverflow.com/a/13091694
	projectMouseToZPlane()
	{

		var vec = new THREE.Vector3();
		var pos = new THREE.Vector3();

		vec.set(
		    ( this.mouse.x / window.innerWidth ) * 2 - 1,
		    - ( this.mouse.y / window.innerHeight ) * 2 + 1,
		    0.5 );

		vec.unproject( this.camera );

		vec.sub( this.camera.position ).normalize();

		var distance = -this.camera.position.z / vec.z;

		return pos.copy( this.camera.position ).add( vec.multiplyScalar( distance ) );

	}

	addMouseDebug()
	{

		this.mouseDebug = new THREE.Mesh( 
			new THREE.SphereGeometry( 1, 6, 6 ), 
			new THREE.MeshBasicMaterial( { color: 0xff0000 } ) 
		);

		this.scene.add( this.mouseDebug );

	}

}

