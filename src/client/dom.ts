import Player from './player';

const statusTexts = {
  connecting: 'Yhdistetään',
  signin: 'Kerro nimesi',
  searching: 'Odotetaan pelaajia',
  disconnected: 'Yhteys katkesi',
  empty: '',
};

export const $ = document.querySelector.bind(document);
export const $all = document.querySelectorAll.bind(document);

const statusTextEl = $('.statustext') as HTMLDivElement;
const colsEl = $all('.board > .col') as HTMLDivElement[];

const signinEl = $('.signin') as HTMLDivElement;
const nameInputEl = $('.signin > input') as HTMLInputElement;
const signinButtonEl = $('.signin > button') as HTMLButtonElement;
const playerListEl = $('.playerlist') as HTMLDivElement;
const playerCountEl = $('.playerlist .count') as HTMLDivElement;
const playerNamesEl = $('.playerlist > .names') as HTMLDivElement;

export function eventListener(player: Player): void {
  nameInputEl.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      doLogin(player);
    }
  });

  signinButtonEl.addEventListener('click', () => {
    doLogin(player);
  });
}

function doLogin(player: Player): void {
  const name = nameInputEl.value.trim();

  if (name === '') {
    alert('Laita joku nimi pelle.');
    return;
  }

  animate(signinEl, 'fadeout 0.5s');
  animate(playerListEl, 'slideup 1.0s');

  player.signin(name);
}

export function setStatusText(key: string): void {
  const text = statusTexts[key];
  statusTextEl.innerHTML = text;
}

export function enableBoard(): void {
  statusTextEl.innerHTML = 'Aloita!';
  setTimeout(() => {
    statusTextEl.innerHTML = '';
  }, 1000);

  Array.from(colsEl).map(col => col.classList.remove('nohover'));
}

export function updatePlayerList(self: Player): void {
  const { app } = self;

  playerCountEl.innerHTML = `(${app.playersInLobby} aulassa, ${
    app.playersInGame
  } pelissä)`;

  playerNamesEl.innerHTML = app.playerList
    .filter(player => !player.opponentID)
    .map(player => {
      const isSelf = player.id === app.player.id;
      const challengeBtn =
        app.player.name && !isSelf
          ? `<button class="challenge">Haasta</button>`
          : '';

      return `<div class="player" data-id="${player.id}">
        <div>${player.name}</div>${challengeBtn}
      </div>`;
    })
    .join('\n');

  const challengeBtns = Array.from(
    $all('.playerlist .challenge')
  ) as HTMLElement[];

  challengeBtns.map(btn => {
    btn.addEventListener('click', e => {
      const target = e.target as HTMLButtonElement;
      const targetID = (target.closest(
        '.player'
      ) as HTMLDivElement).getAttribute('data-id');

      self.sendData('challenge to', targetID);
    });
  });

  if ((self.data && self.data.opponentID) || app.playersInLobby >= 2) {
    setStatusText('empty');
  } else if (app.player.name) {
    setStatusText('searching');
  }
}

export function animate(el: HTMLElement, animation: string): void {
  el.style.animation = animation;
  el.style.animationIterationCount = '1';
  el.style.animationFillMode = 'forwards';
}
