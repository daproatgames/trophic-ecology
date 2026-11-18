import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] });
const ctx1 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const host = await ctx1.newPage(); const guest = await ctx2.newPage();
for (const p of [host,guest]) { p.setDefaultTimeout(10000); p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,120))}); }
async function openLobby(p){await p.goto('http://127.0.0.1:4175/#/arcade/karting',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(900); await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Race online')); b?.click();}); await p.waitForTimeout(500);}
await openLobby(host); await host.getByLabel('Your name').fill('Alex'); await host.getByRole('button',{name:/Create room/}).click({force:true}); await host.waitForTimeout(1800);
const code=await host.evaluate(()=>{const els=[...document.querySelectorAll('span')]; const el=els.find(e=>/^[A-Z2-9]{5}$/.test((e.textContent||'').trim())); return el?.textContent?.trim()||'';});
console.log('CODE',code);
const lap1=host.getByRole('button',{name:'1 lap'}); if(await lap1.count()) await lap1.click({force:true});
await openLobby(guest); await guest.getByLabel('Your name').fill('Sam'); await guest.getByLabel('Room code').fill(code); await guest.getByRole('button',{name:/^Join$/}).click({force:true}); await guest.waitForTimeout(4000);
console.log('HOST CONNECTED?',(await host.locator('body').innerText()).slice(-220));
const start=host.getByRole('button',{name:/Start the race/}); console.log('START COUNT',await start.count());
if(await start.count()){await start.click({force:true}); await host.waitForTimeout(3600); console.log('STARTED'); for(let i=0;i<50;i++){await host.keyboard.press(String((i%4)+1)); await guest.keyboard.press(String((i%4)+1)); await host.waitForTimeout(1000); const hb=await host.locator('body').innerText(); const gb=await guest.locator('body').innerText(); if(hb.includes('RUN COMPLETE')||gb.includes('RUN COMPLETE')){console.log('FINISHED',i);break;}} console.log('HOST END',(await host.locator('body').innerText()).slice(-450)); console.log('GUEST END',(await guest.locator('body').innerText()).slice(-450));}
await browser.close();
