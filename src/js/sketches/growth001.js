import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

import LineFS from '../../shaders/growth_lines.fs';
import LineVS from '../../shaders/growth_lines.vs';

export default class Growth001 extends THREE.Object3D
{

	constructor( camera, renderer )
	{

		super();

		this.camera = camera;
		this.renderer = renderer;

		this.controls = new OrbitControls( camera, this.renderer.domElement );

		this.pointCount = 1024 * 10;
		// this.pointCount = 1024;
		// this.pointCount = 512;
		this.spread = 24;

		this.maxDist = Math.pow( 1.3, 2 );
		this.maxNeighbours = 12;
		this.maxBranches = 9;
		this.rot = new THREE.Vector3( 0, 0, 0 );

		this.initPoints();

		this.setStartPoints();

		this.startGrowing();

		// this.initGeometry();

	}

	startGrowing()
	{

		this.maxAge = 0;

		while( this.activePoints.length > 0 )
		{

			var pt = this.points[ this.activePoints[0] ];
			//pt.age = age;
			this.activePoints.shift();
			
			this.growPoint( pt );
			
			if( pt.age > this.maxAge )
			{

				this.maxAge = pt.age;

			}

		}

		console.log( 'solved' );

		this.parseLines();
		// this.drawNeighboursRandom();

		this.initGeometry();

		this.addPointGeo();


	}

	drawNeighboursRandom()
	{

		var rand = Math.floor( Math.random() * this.points.length );
		var pt = this.points[ rand ];
		console.log( pt.links );
		for( var i = 0; i < pt.links.length; i++ )
		{

			var ptB = this.points[ pt.links[ i ] ];

			this.geoPoints.push( pt.pos );
			this.geoPoints.push( ptB.pos );

		}

	}

	addPointGeo()
	{

		var pts = [];
		for( var i = 0; i < this.points.length; i++ )
		{

			if( this.points[i].used )
			{
				pts.push( this.points[ i ].pos );
			}

		}

		// var geo = new THREE.BufferGeometry().setFromPoints( pts );
		var geo = new THREE.Geometry().setFromPoints( pts );
		

		var mat = new THREE.PointsMaterial({ color:0xff33cc, size: 0.075 });

		this.ptsGeo = new THREE.Points( geo, mat );
		this.add( this.ptsGeo );

	}

	parseLines()
	{

		this.vertColors = [];
		this.links = 0;
		for( var i = 0; i < this.pointCount; i++ )
		{

			this.addPointLines( this.points[ i ] );

		}
		// console.log( this.links, 'links' );

	}

	addPointLines( pt )
	{

		for( var i = 0; i < pt.links.length; i++ )
		{

			var ptB = this.points[ pt.links[ i ] ];
			this.geoPoints.push( pt.pos );
			this.geoPoints.push( ptB.pos );
			this.vertColors.push( pt.age );
			this.vertColors.push( ptB.age );
			this.links++;

		}

	}

	growPoint( pt )
	{

		var avail = [];
		for( var i = 0; i < pt.neighbours.length; i++ )
		{
			if( !this.points[ pt.neighbours[ i ].pt ].used )
			{
				avail.push( pt.neighbours[ i ].pt );
			}
		}

		var maxJoins = Math.min( this.maxBranches, avail.length );


		for( var i = 0; i < maxJoins; i++ )
		{

			var rand = Math.floor( Math.random() * avail.length );
			var nextPt = avail[ rand ];
			if( !this.points[ nextPt ].used )
			{
				pt.links.push( nextPt );
				pt.neighbours.splice( rand, 1 );
				
				this.activePoints.push( nextPt );
				this.points[ nextPt ].used = true;
				this.points[ nextPt ].age = pt.age + 1;

			}

		}

	}

	setStartPoints()
	{

		var startPoint = Math.floor( Math.random() * this.pointCount );
		this.activePoints = [ startPoint ];

	}

	initPoints()
	{

		this.points = [];
		this.geoPoints = [];

		var s = this.spread / 2.0;
		for( var i = 0; i < this.pointCount; i++ )
		{

			var pos = new THREE.Vector3();
			pos.x = -s + Math.random() * this.spread;
			pos.y = -s + Math.random() * this.spread;
			pos.z = -s + Math.random() * this.spread;

			this.points.push({
				id: i,
				pos: pos,
				used: false,
				age: 0,
				neighbours: [],
				neighbourDist: this.maxDist,
				links: []
			});

		}

		for( var i = 0; i < this.pointCount; i++ )
		{
			
			this.findPointNeighbours( this.points[ i ] );

		}

	}

	findPointNeighbours( pt )
	{

		for( var i = 0; i < this.points.length; i++ )
		{

			var id = this.points[i].id;
			if( id != pt.id ) // check yourself
			{
				
				var ptB = this.points[ i ];
				var distSq = pt.pos.distanceToSquared( ptB.pos );
				if( distSq < pt.neighbourDist )
				{

					this.addNeighbour( pt, ptB, distSq );

				}

			}

		}

	}

	// add ptB to ptA as a neighbour
	addNeighbour( ptA, ptB, dist )
	{

		ptA.neighbours.push( { pt: ptB.id, dist: dist } );
		ptA.neighbours.sort(function( a, b ){
			return a.dist - b.dist;
		});
		
		if( ptA.neighbours.length == this.maxNeighbours )
		{
			ptA.neighbours.pop();
			ptA.neighbourDist = dist;
		}

	}

	initGeometry()
	{

		// var geo = new THREE.BufferGeometry().setFromPoints( this.geoPoints );
		var geo = new THREE.Geometry().setFromPoints( this.geoPoints );

		var vertInc = 1.0 / this.maxAge;

		for( var i = 0; i < geo.vertices.length; i += 2 )
		{
			var val = vertInc * this.vertColors[ i ];
			var valB = val + vertInc;
			geo.colors[ i ] = new THREE.Color( val, val, val );
			geo.colors[ i + 1 ] = new THREE.Color( valB, valB, valB );
		}

		var uniforms = {
			'time' : { value: 0 }
		}

		// var mat = new THREE.LineBasicMaterial({
		var mat = new THREE.ShaderMaterial({
			fragmentShader: LineFS,
			vertexShader: LineVS,
			uniforms: uniforms,
			vertexColors: THREE.VertexColors
		});

		mat.uniforms = uniforms;

		this.lines = new THREE.LineSegments( geo, mat );

		this.add( this.lines );

	}

	update( mouse )
	{

		this.rot.y += 0.005;
		this.lines.material.uniforms[ 'time' ].value = performance.now();
		this.rotation.setFromVector3( this.rot );

	}

	handleResize()
	{

	}

}
