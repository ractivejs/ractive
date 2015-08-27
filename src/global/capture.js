let stack = [];
let captureGroup;

export function startCapturing () {
	stack.push( captureGroup = [] );
}

export function stopCapturing () {
	return stack.pop();
}

export function capture ( model ) {
	if ( captureGroup ) {
		captureGroup.push( model );
	}
}
