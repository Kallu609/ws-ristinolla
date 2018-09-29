import { $, animate } from './elementHelper';
import App from './app';
import { IPlayer } from '../lib/types';

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
    const { ws, app } = this;

    ws.onopen = () => {
      console.log('Connected to server.');
      this.app.setGuideText('signin');
    };

    ws.onmessage = ev => {
      const { data } = ev;
      const [command, ...args] = data.split(' ');

      if (command === 'id') {
        app.playerID = args[0];
      }

      if (command === 'playerlist') {
        const joined = args.join(' ');
        const playerList = JSON.parse(joined) as Array<IPlayer>;

        playerCountEl.innerHTML = playerList.length.toString();
        playerNamesEl.innerHTML = playerList
          .map(player => {
            const name =
              player.name + (player.id === app.playerID ? ' (Sinä)' : '');
            return `<div class="player" data-id="">${name}</div>`;
          })
          .join('\n');
      }
    };
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

    this.app.setGuideText('searching');
  }
}

export default SocketHandler;
