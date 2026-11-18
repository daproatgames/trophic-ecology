import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] });
const ctx1 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const host = await ctx1.newPage(); const guest = await ctx2.newPage();
for (const p of [host,guest]) { p.setDefaultTimeout(12000); p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error') console.log('CONSOLE',m.text().slice(0,160))}); }
async function openLobby(p){await p.goto('http://127.0.0.1:4174/#/arcade/karting',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(900); await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Race online')); b?.click();}); await p.waitForTimeout(500);}
await openLobby(host); await host.getByLabel('Your name').fill('Alex'); await host.getByRole('button',{name:/Create room/}).click({force:true}); await host.waitForTimeout(2200);
const t=await host.locator('body').innerText(); const code=(t.match(/\b[A-Z2-9]{5}\b/g)||[]).find(x=>x.length===5); console.log('CODE',code);
await openLobby(guest); await guest.getByLabel('Your name').fill('Sam'); await guest.getByLabel('Room code').fill(code||''); await guest.getByRole('button',{name:/^Join$/}).click({force:true});
await guest.waitForTimeout(5000);
console.log('GUEST JOIN', (await guest.locator('body').innerText()).slice(-420));
console.log('HOST JOIN', (await host.locator('body').innerText()).slice(-420));
const start=host.getByRole('button',{name:/Start the race/}); console.log('START',await start.count());
if(await start.count()){await start.click({force:true}); await host.waitForTimeout(4500); await guest.waitForTimeout(1200); console.log('HOST RACE',(await host.locator('body').innerText()).slice(-500)); console.log('GUEST RACE',(await guest.locator('body').innerText()).slice(-500)); await host.keyboard.press('1'); await guest.keyboard.press('1'); await host.waitForTimeout(1200); console.log('HOST ANSWER',(await host.locator('body').innerText()).slice(-250)); console.log('GUEST ANSWER',(await guest.locator('body').innerText()).slice(-250));}
await browser.close();
