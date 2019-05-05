import createRandom from './rand.js';

function createGame(elem, rows = 9, cols = 9, mines = 10) {
  // eslint-disable-next-line no-param-reassign
  elem.innerHTML = '';

  elem.insertAdjacentHTML(
    'beforeend',
    `
      <div class="container">${`
        <div class="row">
          ${'<div class="cell"></div>'.repeat(cols)}
        </div>
      `.repeat(rows)}
      </div>
    `,
  );

  const rand = createRandom(Date.now().toString(36));
  // const rand = createRandom('poop');

  const gridSize = rows * cols;
  const grid = new Array(gridSize).fill(null);
  const cells = Array.from(elem.querySelectorAll('.cell'));

  for (let mine = 0; mine < mines; mine++) {
    let index;
    do {
      index = Math.floor(rand() * gridSize);
    } while (grid[index] === 'mine');
    grid[index] = 'mine';
    // cells[index].classList.add('mine');
  }

  function getAdjacentIndexes(index) {
    const hasTop = index - cols >= 0;
    const hasBottom = index + cols < gridSize;
    const hasLeft = index % cols >= 1;
    const hasRight = index % cols < cols - 1;
    return [
      hasTop ? index - cols : null, // n
      hasBottom ? index + cols : null, // s
      hasLeft ? index - 1 : null, // w
      hasRight ? index + 1 : null, // e
      hasTop && hasLeft ? index - cols - 1 : null, // nw
      hasTop && hasRight ? index - cols + 1 : null, // ne
      hasBottom && hasLeft ? index + cols - 1 : null, // sw
      hasBottom && hasRight ? index + cols + 1 : null, // se
    ].filter(i => i != null);
  }

  function getNumberOfAdjacentMines(index) {
    const adjacent = getAdjacentIndexes(index);
    return adjacent.filter(i => grid[i] === 'mine').length;
  }

  function revealCell(index) {
    if (index >= 0 && index < gridSize && grid[index] !== 'revealed') {
      cells[index].classList.add('revealed');
      cells[index].classList.remove('flag');
      if (grid[index] === 'mine') {
        cells[index].classList.add('mine');
      } else {
        grid[index] = 'revealed';
        const numAdjacentMines = getNumberOfAdjacentMines(index);
        if (!numAdjacentMines) {
          const adjacent = getAdjacentIndexes(index);
          adjacent.forEach(revealCell);
        } else {
          cells[index].classList.add('number');
          cells[index].dataset.number = numAdjacentMines;
        }
      }
    }
  }

  const container = elem.querySelector('.container');

  function gameOver(message) {
    container.classList.add('game-over');
    // eslint-disable-next-line no-use-before-define
    container.removeEventListener('click', onCellClick);
    // eslint-disable-next-line no-use-before-define
    container.removeEventListener('auxclick', onCellMark);
    setTimeout(() => {
      // eslint-disable-next-line no-alert
      alert(message);
    }, 100);
  }

  function onCellClick(event) {
    const cell = event.target.closest('.cell');
    const index = cells.indexOf(cell);
    if (
      cell
      && index !== -1
      && grid[index] !== 'revealed'
      && !cells[index].classList.contains('flag')
    ) {
      if (grid[index] === 'mine') {
        Object.keys(grid)
          .filter(i => grid[i] === 'mine')
          .forEach(revealCell);
        cells[index].classList.add('explosion');
        gameOver('GAME OVER');
        return;
      }
      revealCell(index);
      if (!grid.filter(e => e == null).length) {
        gameOver('YOU WIN');
      }
    }
  }

  function onCellMark(event) {
    const cell = event.target.closest('.cell');
    const index = cells.indexOf(cell);
    if (cell && index !== -1 && grid[index] !== 'revealed') {
      cells[index].classList.toggle('flag');
    }
  }

  container.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  container.addEventListener('click', onCellClick);
  container.addEventListener('auxclick', onCellMark);
}

const params = new URLSearchParams(window.location.search);

createGame(
  document.querySelector('#game'),
  Number(params.get('rows')) || undefined,
  Number(params.get('cols')) || undefined,
  Number(params.get('mines')) || undefined,
);
