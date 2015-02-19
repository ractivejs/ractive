export default function Viewmodel$clearCache ( keypath, keepExistingWrapper ) {
	(keypath || this.rootKeypath).clearCachedValue( keepExistingWrapper );
}
