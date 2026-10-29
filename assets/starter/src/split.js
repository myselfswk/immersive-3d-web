// Tiny accessible word splitter. Words are wrapped in a mask (.w) with an inner span (.wi)
// that animates with yPercent. The original text is kept in aria-label.

export function splitWords(el) {
  if (el.dataset.splitDone) return [...el.querySelectorAll('.wi')];
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.setAttribute('aria-hidden', 'true');
          const i = document.createElement('span');
          i.className = 'wi';
          i.textContent = part;
          w.appendChild(i);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.splitDone = '1';
  return [...el.querySelectorAll('.wi')];
}
