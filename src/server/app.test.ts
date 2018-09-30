import * as puppeteer from 'puppeteer';
import { Page, Browser } from 'puppeteer';
import { httpServerPort } from '../../config';

const $ = async (selector: string): Promise<HTMLElement> => {
  return (await page.evaluate(() =>
    document.querySelector(selector)
  )) as HTMLElement;
};

let browser: Browser;
let page: Page;

async function openBrowser(): Promise<void> {
  if (browser) return;

  browser = await puppeteer.launch();
  page = await browser.newPage();
  await page.goto(`http://localhost:${httpServerPort}`);
  await page.waitFor(1000);
}

async function closeBrowser(): Promise<void> {
  await browser.close();
}

async function testSignIn(): Promise<string> {
  return ''; // TODO
}

async function getPlayerCounts(): Promise<string> {
  await openBrowser();
  await page.screenshot({ path: 'example.png' });

  const count = await $('.playerlist .count');
  return count.textContent as string;
}

test('test player count', async () => {
  await openBrowser();
  const playerCounts = await getPlayerCounts();
  expect(playerCounts).toMatch(/^\(\d+ aulassa, \d+ pelissä\)$/);
  closeBrowser();
});
