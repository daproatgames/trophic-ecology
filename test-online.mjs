import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] });
const ctx1 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const host = await ctx1.newPage(); const guest = await ctx2.newPage();
for (const p of [host, guest]) { p.setDefaultTimeout(12000); p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error') console.log('CONSOLE',m.text().slice(0,200))}); }
async function enter(p, path='/arcade/karting'){await p.goto('http://127.0.0.1:5173/#'+path,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(1000); await p.getByRole('button',{name:'Explore first'}).click().catch(()=>{}); await p.waitForTimeout(500); await p.getByRole('button',{name:/Race online/}).click(); await p.waitForTimeout(400);}
await enter(host);
await host.getByLabel('Your name').fill('Alex');
await host.getByRole('button',{name:/Create room/}).click();
await host.waitForTimeout(2000);
const text=await host.locator('body').innerText();
console.log('HOST AFTER CREATE', text.slice(-500));
const code=(text.match(/\b[A-Z2-9]{5}\b/g)||[]).find(x=>x.length===5 && !['PLAYER','ROOM','ONLINE'].includes(x));
console.log('CODE',code);
await host.screenshot({path:'/tmp/online-host-wait.png'});
await enter(guest);
await guest.getByLabel('Your name').fill('Sam');
await guest.getByLabel('Room code').fill(code||'');
await guest.getByRole('button',{name:/^Join$/}).click();
await guest.waitForTimeout(3000);
console.log('GUEST BODY', (await guest.locator('body').innerText()).slice(-400));
console.log('HOST BODY2', (await host.locator('body').innerText()).slice(-400));
await host.screenshot({path:'/tmp/online-host-connected.png'});
await guest.screenshot({path:'/tmp/online-guest-connected.png'});
const start=host.getByRole('button',{name:/Start the race/});
console.log('start count',await start.count());
if(await start.count()){await start.click(); await host.waitForTimeout(4500); await guest.waitForTimeout(4500); await host.screenshot({path:'/tmp/online-host-race.png'}); await guest.screenshot({path:'/tmp/online-guest-race.png'});
 console.log('HOST RACE', (await host.locator('body').innerText()).slice(-700)); console.log('GUEST RACE', (await guest.locator('body').innerText()).slice(-700));
 await host.keyboard.press('1'); await guest.keyboard.press('1'); await host.waitForTimeout(1000); await guest.waitForTimeout(1000);
 await host.screenshot({path:'/tmp/online-host-answered.png'}); await guest.screenshot({path:'/tmp/online-guest-answered.png'});
}
await browser.close();
