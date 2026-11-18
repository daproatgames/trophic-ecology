import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] });
const ctx1 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const host = await ctx1.newPage(); const guest = await ctx2.newPage();
for (const p of [host,guest]) { p.setDefaultTimeout(8000); p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error') console.log('CONSOLE',m.text().slice(0,160))}); }
async function openLobby(p){await p.goto('http://127.0.0.1:5173/#/arcade/karting',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(900); await p.getByRole('button',{name:'Explore first'}).click().catch(()=>{}); await p.waitForTimeout(300); await p.locator('button').filter({hasText:'Race online'}).first().click(); await p.waitForTimeout(300);}
await openLobby(host);
console.log('HOST LOBBY OK',(await host.locator('body').innerText()).slice(-300));
await host.getByLabel('Your name').fill('Alex');
await host.getByRole('button',{name:/Create room/}).click(); await host.waitForTimeout(1500);
const t=await host.locator('body').innerText(); const code=(t.match(/\b[A-Z2-9]{5}\b/g)||[]).find(x=>x.length===5);
console.log('CODE',code);
await openLobby(guest);
console.log('GUEST LOBBY',(await guest.locator('body').innerText()).slice(-300));
await guest.getByLabel('Your name').fill('Sam');
await guest.getByLabel('Room code').fill(code||'');
await guest.getByRole('button',{name:/^Join$/}).click();
await guest.waitForTimeout(4000);
console.log('GUEST AFTER JOIN',(await guest.locator('body').innerText()).slice(-500));
console.log('HOST AFTER JOIN',(await host.locator('body').innerText()).slice(-400));
await host.screenshot({path:'/tmp/host-before-start.png'}); await guest.screenshot({path:'/tmp/guest-before-start.png'});
const start=host.getByRole('button',{name:/Start the race/}); console.log('START COUNT',await start.count());
if(await start.count()){await start.click(); await host.waitForTimeout(4500); await guest.waitForTimeout(1000); await host.screenshot({path:'/tmp/host-race-online.png'}); await guest.screenshot({path:'/tmp/guest-race-online.png'}); console.log('HOST RACE',(await host.locator('body').innerText()).slice(-500)); console.log('GUEST RACE',(await guest.locator('body').innerText()).slice(-500));}
await browser.close();
