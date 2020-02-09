import * as THREE from 'three';

export default class Chasers extends THREE.Object3D
{

	constructor()
	{

		super();

		this.pieceCount = 250;

		this.maxSpeed = 0.65;

		this.target = new THREE.Vector3();

		var loader = new THREE.CubeTextureLoader();
		loader.setPath( 'assets/textures/' );

		this.textureCube = loader.load( [
			'px.png', 'nx.png',
			'py.png', 'ny.png',
			'pz.png', 'nz.png'
		] );

		this.createObjects();

	}

	update( mouse )
	{

		if( mouse )
		{
			this.target.setX( ( -0.5 + ( mouse.x / window.innerWidth ) ) * 40 );
			this.target.setY( ( -0.5 + ( mouse.y / window.innerHeight ) ) * -40 );
		}

		for( var i = 0; i < this.pieces.length; i++ )
		{

			var steer = new THREE.Vector3().subVectors( this.target, this.data[i].pos );
			steer.multiplyScalar( 0.001 );

			if( mouse.mouseDown )
			{
				steer.multiplyScalar( -0.01 );
			}

			this.data[i].vel.add( steer );

			if( this.data[i].vel.lengthSq() > this.maxSpeed )
			{
				this.data[i].vel.normalize().multiplyScalar( this.maxSpeed );
			}

			this.data[i].pos.add( this.data[i].vel );

			this.pieces[i].position.copy( this.data[i].pos );

		}

	}

	handleResize()
	{

	}

	createObjects()
	{



		this.pieces = [];
		this.data = [];

		for( var i = 0; i < this.pieceCount; i++ )
		{

			var pos = new THREE.Vector3(
				-10 + Math.random() * 20,
				-10 + Math.random() * 20,
				-10 + Math.random() * 20
			);

			var vel = new THREE.Vector3(
				-3 + Math.random() * 6,
				-3 + Math.random() * 6,
				-3 + Math.random() * 6
			);

			this.data.push( { pos: pos, vel: vel } );

			var geo = new THREE.SphereBufferGeometry( 1, 16, 16 );
			var mat = new THREE.MeshStandardMaterial( { 
				color: 0xcccccc, 
				roughness: 0.73,
				metalness: 0.5,
				envMap: this.textureCube
			} );
			var p = new THREE.Mesh( geo, mat );

			p.position.copy( pos );

			p.castShadow = true;
			p.receiveShadow = true;

			this.add( p );

			this.pieces.push( p );

		}

	}

}
