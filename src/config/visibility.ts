import { win, doc, vendors } from './environment';

export let visible: boolean;
let hidden = 'hidden';

function onChange(): void {
  visible = !doc[hidden];
}

/* istanbul ignore next */
function onHide(): void {
  visible = false;
}

/* istanbul ignore next */
function onShow(): void {
  visible = true;
}

if (doc) {
  let prefix: string;

  /* istanbul ignore next */
  if (hidden in doc) {
    prefix = '';
  } else {
    let i = vendors.length;
    while (i--) {
      const vendor = vendors[i];
      hidden = vendor + 'Hidden';

      if (hidden in doc) {
        prefix = vendor;
        break;
      }
    }
  }

  /* istanbul ignore else */
  if (prefix !== undefined) {
    doc.addEventListener(prefix + 'visibilitychange', onChange);
    onChange();
  } else {
    // gah, we're in an old browser
    if ('onfocusout' in doc) {
      // Why `as Document` because otherwise doc has type never (only inside this if)
      (doc as Document).addEventListener('focusout', onHide);
      (doc as Document).addEventListener('focusin', onShow);
    } else {
      win.addEventListener('pagehide', onHide);
      win.addEventListener('blur', onHide);

      win.addEventListener('pageshow', onShow);
      win.addEventListener('focus', onShow);
    }

    visible = true; // until proven otherwise. Not ideal but hey
  }
}
