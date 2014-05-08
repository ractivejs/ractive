export default function Section$toString () {
	var str, i, len;

	str = '';

	i = 0;
	len = this.length;

	for ( i=0; i<len; i+=1 ) {
		str += this.fragments[i].toString();
	}

	return str;
}
