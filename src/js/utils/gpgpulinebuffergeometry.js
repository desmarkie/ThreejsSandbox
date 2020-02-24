import * as THREE from 'three';

export default class GPGPULineBufferGeometry extends THREE.BufferGeometry
{

	constructor( textureWidth )
	{

		var lineCount = textureWidth * textureWidth;
		var points = lineCount * 2;

		super();

		this.verts = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
		var refs = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );

		this.setAttribute( 'position', this.verts );
		this.setAttribute( 'reference', refs );

		this.vert = 0;

		for( var line = 0; line < lineCount; line++ )
		{

			this.addVerts([
				0.0, 0.0, 0.0,
				0.0, 0.0, 1.0
			]);

		}

		this.vert = null;

		for( var vert = 0; vert < lineCount * 2; vert++ )
		{

			var i = Math.floor( vert / 2 );
			var x = ( i % textureWidth ) / textureWidth;
			var y = Math.floor( i / textureWidth ) / textureWidth;

			refs.array[ vert * 2 ] = x;
			refs.array[ vert * 2 + 1] = y;

		}

	}

	addVerts( vals )
	{

		for( var i = 0; i < vals.length; i++ )
		{

			this.verts.array[ this.vert ] = vals[ i ];
			this.vert++;

		}

	}



}