export default class MouseInput
{

	constructor( x = 0, y = 0 )
	{

		this.x = x;
		this.y = y;
		this.mouseDown = false;

		document.onmousemove = this.handleMouseMove.bind( this );
		document.onmousedown = this.handleMouseDown.bind( this );
		document.onmouseup = this.handleMouseUp.bind( this );

	}

	handleMouseDown()
	{

		this.mouseDown = true;

	}

	handleMouseUp()
	{

		this.mouseDown = false;

	}

	handleMouseMove( evt )
	{

		this.x = evt.pageX;
		this.y = evt.pageY;

	}

}