import { $, animate, $all } from './elementHelper';
import App from './app';
import { IGameData, IPlayer } from '../lib/types';
import { webSocketPort } from '../../config';

const signinEl = $('.signin') as HTMLDivElement;
const nameInputEl = $('.signin > input') as HTMLInputElement;
const signinButtonEl = $('.signin > button') as HTMLButtonElement;
const playerListEl = $('.playerlist') as HTMLDivElement;
const playerCountEl = $('.playerlist .count') as HTMLDivElement;
const playerNamesEl = $('.playerlist > .names') as HTMLDivElement;

class SocketHandler {
  ws: WebSocket;

  constructor(public app: App) {
    this.ws = new WebSocket(`ws://localhost:${webSocketPort}`);
    this.handleSocket();
    this.eventListeners();
  }

  handleSocket(): void {
    const { ws } = this;

    ws.onopen = () => {
      console.log('Connected to server.');
      this.app.setStatusText('signin');
    };

    ws.onclose = () => {
      this.app.setStatusText('disconnected');
    };

    ws.onmessage = ev => {
      const { data } = ev;
      this.commandHandler(data);
    };
  }

  commandHandler(data: any): void {
    const { app } = this;
    const [command, ...args] = data.split(' ');

    if (command === 'id') {
      app.playerID = args[0];
    }

    if (command === 'playerlist') {
      const joined = args.join(' ');
      app.playerList = JSON.parse(joined) as IGameData;

      this.updatePlayerList();
    }

    if (command === 'startgame') {
      app.startGame();
    }

    if (command === 'challenge' && args.length === 2) {
      const [action, value] = args;

      if (action === 'from') {
        const from = app.playerList.find(x => x.id === value) as IPlayer;
        const accept = confirm(`are u wana fite m8? t. ${from.name} ankka`);

        if (accept) {
          this.ws.send('challenge accept');
        }
      }

      this.updatePlayerList();
    }
  }

  eventListeners(): void {
    nameInputEl.addEventListener('keyup', e => {
      if (e.keyCode === 13) {
        this.doLogin();
      }
    });

    signinButtonEl.addEventListener('click', () => {
      this.doLogin();
    });
  }

  doLogin(): void {
    const name = nameInputEl.value.trim();

    if (name === '') {
      alert('Laita joku nimi pelle.');
      return;
    }

    animate(signinEl, 'fadeout 0.5s');
    animate(playerListEl, 'slideup 1.0s');

    this.ws.send(`signin ${name}`);
    this.app.playerName = name;
  }

  updatePlayerList(): void {
    const { app } = this;

    playerCountEl.innerHTML = `(${app.playersInLobby} aulassa, ${
      app.playersIngame
    } pelissä)`;

    playerNamesEl.innerHTML = app.playerList
      .filter(player => !player.opponentID)
      .map(player => {
        const isSelf = player.id === app.playerID;
        const challengeBtn =
          app.playerName && !isSelf
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

        this.ws.send(`challenge to ${targetID}`);
      });
    });

    this.app.setStatusText(
      this.app.playersInLobby === 1 ? 'searching' : 'empty'
    );
  }
}

export default SocketHandler;
