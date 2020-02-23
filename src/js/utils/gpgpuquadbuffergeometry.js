import * as THREE from 'three';

export default class GPGPUQuadBufferGeometry extends THREE.BufferGeometry
{

	constructor( textureWidth )
	{

		var quadCount = textureWidth * textureWidth;
		var triangles = quadCount * 2;
		var points = triangles * 3;

		super();


		this.verts = new THREE.BufferAttribute( new Float32Array( points * 3 ), 3 );
		var refs = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );
		var uvs = new THREE.BufferAttribute( new Float32Array( points * 2 ), 2 );

		this.setAttribute( 'position', this.verts );
		this.setAttribute( 'reference', refs );
		this.setAttribute( 'iuv', uvs );

		this.vert = 0;
		this.uv = 0;

		for( var quad = 0; quad < quadCount; quad++ )
		{

			//bl
			this.addVerts( [
				-1.0, -1.0, 0.0,
				1.0, -1.0, 0.0,
				1.0, 1.0, 0.0
			] );

			uvs.array[ this.uv ++ ] = 0;
			uvs.array[ this.uv ++ ] = 0;
			uvs.array[ this.uv ++ ] = 1;
			uvs.array[ this.uv ++ ] = 0;
			uvs.array[ this.uv ++ ] = 1;
			uvs.array[ this.uv ++ ] = 1;

			//tr
			this.addVerts( [
				1.0, 1.0, 0.0,
				-1.0, 1.0, 0.0,
				-1.0, -1.0, 0.0
			] );

			uvs.array[ this.uv ++ ] = 1;
			uvs.array[ this.uv ++ ] = 1;
			uvs.array[ this.uv ++ ] = 0;
			uvs.array[ this.uv ++ ] = 1;
			uvs.array[ this.uv ++ ] = 0;
			uvs.array[ this.uv ++ ] = 0;

		}

		for( var v = 0; v < triangles * 3; v++ )
		{

			var i = Math.floor( v / 6 );
			var x = ( i % textureWidth ) / textureWidth;
			var y = Math.floor( i / textureWidth ) / textureWidth;

			refs.array[ v * 2 ] = x + 0.01;
			refs.array[ v * 2 + 1 ] = y + 0.01;
			
			//quadVerts.array[ v ] = v % 9;

		}

		this.scale( 0.2, 0.2, 0.2 );

	}

	addVerts( vals )
	{

		for( var i = 0; i < vals.length; i++ )
		{

			this.verts.array[ this.vert ] = vals[ i ];
			this.vert++;

		}

		//console.log( this.v );
		//return ct;

	}

}
