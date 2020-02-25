import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';

export default class Growth001 extends THREE.Object3D
{

	constructor( camera, renderer )
	{

		super();

		this.camera = camera;
		this.renderer = renderer;

		this.controls = new OrbitControls( camera, this.renderer.domElement );

		this.pointCount = 4096;
		// this.pointCount = 1024;
		// this.pointCount = 128;
		this.spread = 24;

		this.maxDist = 3 * 3;
		this.maxNeighbours = 6;
		this.maxBranches = 3;
		this.rot = new THREE.Vector3( 0, 0, 0 );

		this.initPoints();

		this.setStartPoints();

		this.startGrowing();

		// this.initGeometry();

	}

	startGrowing()
	{

		this.maxAge = 0;
		var age = 0;

		while( this.activePoints.length > 0 )
		{

			var pt = this.points[ this.activePoints[0] ];
			pt.age = age;
			this.activePoints.shift();
			// console.log('activePoints', this.activePoints);
			this.growPoint( pt, age );
			// console.log(this.activePoints.length);

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

		var geo = new THREE.BufferGeometry().setFromPoints( pts );

		var mat = new THREE.PointsMaterial({color:0xff33cc, size: 0.15});

		var ptsGeo = new THREE.Points( geo, mat );
		this.add( ptsGeo );

	}

	parseLines()
	{

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
			this.links++;

		}

	}

	growPoint( pt, age )
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

		// console.log( 'grow', pt.id, age, maxJoins );

		for( var i = 0; i < maxJoins; i++ )
		{

			var rand = Math.floor( Math.random() * avail.length );
			var nextPt = avail[ rand ];
			if( !this.points[ nextPt ].used )
			{
				pt.links.push( nextPt );
				// pt.neighbours.splice( rand, 1 );
				
				this.activePoints.push( nextPt );
				this.points[ nextPt ].used = true;
				// console.log( pt.id, 'to', rand );

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
				neighbourDist: 9999,
				links: []
			});

		}

		// console.log('added', this.points.length);

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

				// if( distSq < ptB.neighbourDist )
				// {

				// 	this.addNeighbour( ptB, pt, distSq );

				// }

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

		// console.log( ptA.neighbours );

	}

	initGeometry()
	{

		this.geo = new THREE.BufferGeometry().setFromPoints( this.geoPoints );

		var mat = new THREE.LineBasicMaterial({
			color: 0x55aaff
		});

		var lines = new THREE.LineSegments( this.geo, mat );
		// var lines = new THREE.Line( this.geo, mat );
		// var lines = new THREE.Mesh( this.geo, mat );

		this.add( lines );

	}

	update( mouse )
	{

		this.rot.y += 0.01;
		this.rotation.setFromVector3( this.rot );

	}

	handleResize()
	{

	}

}
