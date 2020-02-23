export default class SketchSelection
{
	
	constructor( sketchArr )
	{

		this.domElement = document.createElement( 'div' );
		this.options = [];

		for( var i = 0; i < sketchArr.length; i++ )
		{

			this.addOption( i );

		}

		this.domElement.style.position = 'absolute';
		this.domElement.style.top = '0';
		this.domElement.style.left = '0';
		this.domElement.style.color = 'red';
		this.domElement.style.width = '100%';
		this.domElement.style.fontFamily = 'sans-serif';
		this.domElement.style.fontSize = '1.5em';

		document.body.appendChild( this.domElement );

	}

	addOption( val )
	{

		var but = document.createElement( 'div' );
		but.tag = 'sketch_' + val;

		but.style.cursor = 'pointer';
		but.style.display = 'inline';
		but.style.padding = '0.2em';

		but.onclick = this.handleButtonClick.bind( this, val );

		but.innerHTML = ( val + 1 );

		this.options.push( but );
		this.domElement.appendChild( but );

	}

	handleButtonClick( val )
	{
		
		//console.log( 'click', val, window.location.host );
		var target = 'http://' + window.location.host + '?sketch=' + val;
		console.log( target );
		window.location = target;

	}

}