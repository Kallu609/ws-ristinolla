export const $ = document.querySelector.bind(document);
export const $all = document.querySelectorAll.bind(document);

export function animate(el: HTMLElement, animation: string): void {
  el.style.animation = animation;
  el.style.animationIterationCount = '1';
  el.style.animationFillMode = 'forwards';
}
