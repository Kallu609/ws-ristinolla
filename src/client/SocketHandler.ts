import { $, animate } from './elementHelper';
import App from './app';
import { IGameData } from '../lib/types';

const signinEl = $('.signin') as HTMLDivElement;
const nameInputEl = $('.signin > input') as HTMLInputElement;
const signinButtonEl = $('.signin > button') as HTMLButtonElement;
const playerListEl = $('.playerlist') as HTMLDivElement;
const playerCountEl = $('.playerlist .count') as HTMLDivElement;
const playerNamesEl = $('.playerlist > .names') as HTMLDivElement;

class SocketHandler {
  ws: WebSocket;

  constructor(public app: App) {
    this.ws = new WebSocket('ws://localhost:6969');
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

    if (command === 'startmatch') {
      app.startGame();
    }

    if (command === 'playerlist') {
      const joined = args.join(' ');
      app.playerList = JSON.parse(joined) as IGameData;

      playerCountEl.innerHTML = `(${app.playersInlobby} aulassa, ${
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

          return `<div class="player" data-id="">
            <div>${player.name}</div>
            ${challengeBtn}
          </div>`;
        })
        .join('\n');
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

    this.app.setStatusText('searching');
  }
}

export default SocketHandler;
