// https://github.com/jonathantneal/Polyfills-for-IE8/blob/master/getComputedStyle.js
if (document && window && !window.getComputedStyle) {

	const noop = function () { };
	const borderSizes = {};
	const normalProps = {
		fontWeight: 400,
		lineHeight: 1.2, // actually varies depending on font-family, but is generally close enough...
		letterSpacing: 0
	};

	const getPixelSize = function (element, style, property, fontSize) {
		const value = style[property];
		const rawSize = parseFloat(value);
		const rawUnit = value.split(/\d/)[0];
		const isMeasureNotSizeAndUnit = isNaN(rawSize) && /^thin|medium|thick$/.test(value);
		const size = isMeasureNotSizeAndUnit ? getBorderPixelSize(value) : rawSize;
		const unit = isMeasureNotSizeAndUnit ? '' : rawUnit;

		fontSize = fontSize != null ? fontSize
			: /%|em/.test(unit) && element.parentElement ? getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null)
				: 16;

		const rootSize = property == 'fontSize' ? fontSize
			: /width/i.test(property) ? element.clientWidth
				: element.clientHeight;

		return (unit == 'em') ? size * fontSize
			: (unit == 'in') ? size * 96
				: (unit == 'pt') ? size * 96 / 72
					: (unit == '%') ? size / 100 * rootSize
						: size;
	};

	const getBorderPixelSize = function (size) {

		// `thin`, `medium` and `thick` vary between browsers. (Don't ever use them.)
		if (!borderSizes[size]) {
			const div = document.createElement('div');
			div.style.display = 'block';
			div.style.position = 'fixed';
			div.style.width = div.style.height = '0';
			div.style.borderRight = size + ' solid black';
			document.getElementsByTagName('body')[0].appendChild(div);

			const bcr = div.getBoundingClientRect();

			borderSizes[size] = bcr.right - bcr.left;
		}

		return borderSizes[size];
	};

	const setShortStyleProperty = function (style, property) {
		const borderSuffix = property == 'border' ? 'Width' : '';
		const t = `${property}Top${borderSuffix}`;
		const r = `${property}Right${borderSuffix}`;
		const b = `${property}Bottom${borderSuffix}`;
		const l = `${property}Left${borderSuffix}`;

		style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
			: style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
				: style[l] == style[r] ? [style[t], style[r], style[b]]
					: [style[t], style[r], style[b], style[l]]).join(' ');
	};

	const CSSStyleDeclaration = function (element) {

		const style = this;
		const currentStyle = element.currentStyle;
		const fontSize = getPixelSize(element, currentStyle, 'fontSize', null);

		// TODO tidy this up, test it, send PR to jonathantneal!
		for (const property in currentStyle) {
			if (currentStyle[property] === 'normal' && normalProps.hasOwnProperty(property)) {
				style[property] = normalProps[property];
			} else if (/width|height|margin.|padding.|border.+W/.test(property)) {
				if (currentStyle[property] === 'auto') {
					if (/^width|height/.test(property)) {
						// just use clientWidth/clientHeight...
						style[property] = (property === 'width' ? element.clientWidth : element.clientHeight) + 'px';
					} else if (/(?:padding)?Top|Bottom$/.test(property)) {
						style[property] = '0px';
					}
				} else {
					style[property] = getPixelSize(element, currentStyle, property, fontSize) + 'px';
				}
			} else if (property === 'styleFloat') {
				style.float = currentStyle[property];
			} else {
				style[property] = currentStyle[property];
			}
		}

		setShortStyleProperty(style, 'margin');
		setShortStyleProperty(style, 'padding');
		setShortStyleProperty(style, 'border');

		style.fontSize = fontSize + 'px';

		return style;
	};

	CSSStyleDeclaration.prototype = {
		constructor: CSSStyleDeclaration,
		getPropertyPriority: noop,
		getPropertyValue(prop) {
			return this[prop] || '';
		},
		item: noop,
		removeProperty: noop,
		setProperty: noop,
		getPropertyCSSValue: noop
	};

	window.getComputedStyle = function (element) {
		return new CSSStyleDeclaration(element);
	};
}
