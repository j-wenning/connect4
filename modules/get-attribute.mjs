export const getAttribute = (element = null, attributeName = '', bubble = false) => {
  if (!bubble) return element.getAttribute(attributeName)
  let curEl = element
  let attr = null
  while (!(attr = curEl.getAttribute(attributeName)) && curEl.parentElement) curEl = curEl.parentElement
  return attr
}
