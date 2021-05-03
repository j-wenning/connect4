import { createEl } from './modules/create-el.mjs'
import { getAttribute } from './modules/get-attribute.mjs'

const root = document.documentElement
const main = document.querySelector('main')
const header = document.querySelector('header')
const modal = document.querySelector('#modal')
const gameResult = document.querySelector('#gameResult')

const cols = 7
const rows = 6

root.style.setProperty('--board-columns', cols)
root.style.setProperty('--board-rows', rows)

let modalHidden = modal.getAttribute('aria-hidden') === 'true'

main.appendChild(
  createEl(
    'div', 'grid', undefined, ...[...Array(cols * rows)].map((_, i) => [
      'div', 'grid-item', `data-index=${i} data-col=${cols - i % cols} data-player=0`, [
        'svg', 'token', undefined, [
          'use', undefined, 'href=./assets/board-pieces.svg#token'
        ]
      ], [
        'svg', 'slot', undefined, [
          'use', undefined, 'href=./assets/board-pieces.svg#slot'
        ]
      ], [
        'div', 'slot-padding'
      ], [
        'span', 'sr-only'
      ]
    ]),
    ...[...Array(cols)].map((_, i) => [
      'div', 'grid-item', `data-col=${cols - i % cols}`, [
        'button', 'sr-only', 'type=button', [
          `textNode Column ${cols - i % cols}`
        ]
      ]
    ])

  )
)

const toggleModal = toggle => {
  toggle = typeof toggle === 'boolean' ? !toggle : !modalHidden
  modalHidden = toggle
  modal.setAttribute('aria-hidden', toggle)
  document.querySelectorAll('button').forEach(el => {
    if (!modal.contains(el)) el.disabled = !toggle
  })
  return toggle
}

const hoverHandler = (() => {
  const colEls = []
  let hoveredCol
  const observer = new ResizeObserver(() => {
    containerWidth = header.getBoundingClientRect().width
    colWidth = containerWidth / cols
  })
  let containerWidth = 0
  let colWidth = 0
  let colX = 0
  observer.observe(header)
  setInterval(() => {
    root.style.setProperty('--header-item-offset', colX + 'px')
  })
  return e => {
    const col = getAttribute(e.target, 'data-col', true)
    if (hoveredCol === col) return null
    for (let i = 0; i < colEls.length; ++i) colEls[i].classList.remove('highlight')
    hoveredCol = col
    if (!modalHidden) return null
    colEls.splice(0, colEls.length, ...document.querySelectorAll(`[data-col="${hoveredCol}"]`))
    if (col) {
      colX = containerWidth - colWidth * col
      document.querySelector(`[data-col="${col}"] button`).focus()
    }
    for (let i = 0; i < colEls.length; ++i) colEls[i].classList.add('highlight')
  }
})()

const focusHandler = hoverHandler

const clickHandler = (() => {
  const matrix = Array(cols * rows).fill(0)
  const winCon = 4
  const players = 2
  let curPlayer = 1
  const setPlayer = player => {
    header.setAttribute('data-player', player)
    curPlayer = player
  }
  const compareAdjacent = (index, down, left) => {
    if (matrix[index] !== curPlayer) return 0
    if ((index % cols === 6 && left > 0) || (index % cols === 0 && left < 0)) return 1
    return 1 + compareAdjacent(index + left + cols * down, down, left)
  }
  const checkForWin = (index) => {
    return compareAdjacent(index, 1, 0) >= winCon ||
    compareAdjacent(index, 1, 1) + compareAdjacent(index, -1, -1) - 1 >= winCon ||
    compareAdjacent(index, 1, -1) + compareAdjacent(index, -1, 1) - 1 >= winCon ||
    compareAdjacent(index, 0, 1) + compareAdjacent(index, 0, -1) - 1 >= winCon
  }
  const checkForStalemate = () => {
    for (let i = 0; i < cols; ++i) {
      if (matrix[i] === 0) return false
    }
    return true
  }
  const pushToCol = (col) => {
    let curIndex = matrix.length - col
    while (matrix[curIndex]) curIndex -= cols
    if (matrix[curIndex] == null) return null
    matrix[curIndex] = curPlayer
    const el = document.querySelector(`[data-index="${curIndex}"]`)
    el.setAttribute('data-player', curPlayer)
    el.querySelector('.sr-only').textContent = `Player ${curPlayer}`
    if (checkForWin(curIndex)) {
      gameResult.textContent = `Player ${curPlayer} wins!`
      toggleModal(true)
      return null
    }
    if (checkForStalemate()) {
      gameResult.textContent = 'Stalemate!'
      toggleModal(true)
      return null
    }
    setPlayer(Math.max(1, (curPlayer + 1) % (players + 1)))
  }
  return e => {
    if (e.target.id === 'gameReset') {
      const gridItems = document.querySelectorAll('.grid-item[data-player]')
      for (let i = 0; i < gridItems.length; ++i) {
        gridItems[i].setAttribute('data-player', 0)
        gridItems[i].querySelector('.sr-only').textContent = ''
      }
      matrix.fill(0)
      setPlayer(1)
      toggleModal(false)
    }
    const col = getAttribute(e.target, 'data-col', true)
    if (!modalHidden || !col) return null
    document.querySelector(`[data-col="${col}"] button`).focus()
    pushToCol(parseInt(col))
  }
})()

document.addEventListener('mouseover', hoverHandler)
document.addEventListener('focusin', focusHandler)
document.addEventListener('click', clickHandler)
