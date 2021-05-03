export const createEl = (tagName = 'div', classes = '', attributes = '', ...children) => {
  if (/textNode/.test(tagName)) return document.createTextNode(tagName.replace('textNode', '').trim())
  const el = tagName === 'svg' || tagName === 'use'
    ? document.createElementNS('http://www.w3.org/2000/svg', tagName)
    : document.createElement(tagName)
  if (attributes) {
    const attrs = attributes.split(' ').map(pair => pair.split('='))
    for (let i = 0; i < attrs.length; ++i) {
      const [key, val] = attrs[i]
      if (key) el.setAttribute(key, val)
    }
  }
  for (let i = 0; i < children.length; ++i) {
    el.appendChild(createEl(...children[i]))
  }
  el.classList = classes
  return el
}
