const $ = document.querySelector.bind(document);
const $all = document.querySelectorAll.bind(document);

const cols = $all('.board > .col') as HTMLDivElement[];
const signinDiv = $('.signin') as HTMLDivElement;
const nameInput = $('.signin > input') as HTMLInputElement;
const signinBtn = $('.signin > button') as HTMLButtonElement;
const playerList = $('.playerlist') as HTMLDivElement;
const playerCount = $('.playerlist .count') as HTMLDivElement;
const playerNames = $('.playerlist > .names') as HTMLDivElement;


class SocketHandler {
  ws: WebSocket;
  playerName: string;

  constructor() {
    this.ws = new WebSocket('ws://localhost:6969');
    this.webSocketHandler();
    this.listeners();
  }

  webSocketHandler(): void {
    const { ws } = this;

    ws.onopen = () => {
      console.log('Websocket connected.');
    }
    
    ws.onmessage = (ev) => {
      const { data } = ev;
      const [command, ...args] = data.split(' ');
      
      if (command === 'playerlist') {
        const joined = args.join(' ');
        const list = JSON.parse(joined) as string[];
        
        playerCount.innerHTML = list.length.toString();
        playerNames.innerHTML = list.map(name => {
          return `
          <div class="player">
            ${name + (name === this.playerName ? ' (Sinä)' : '')}
          </div>
          `
        }).join('\n');
      }
    }
  }

  listeners(): void {
    signinBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
    
      if (name === '') {
        alert('Laita joku nimi pelle.');
        return;
      }

      animate(signinDiv, 'shrink 0.5s');
      animate(playerList, 'slideup 1.0s');

      Array.from(cols).map(col => col.classList.remove('nohover'));
      this.ws.send(`signin ${name}`);
      this.playerName = name;
    });
  }
}

function animate(el: HTMLElement, animation: string): void {
  el.style.animation = animation;
  el.style.animationIterationCount = '1';
  el.style.animationFillMode = 'forwards';
}

new SocketHandler();