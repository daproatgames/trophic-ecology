import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] });
const ctx1 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const ctx2 = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
const host = await ctx1.newPage(); const guest = await ctx2.newPage();
for (const p of [host,guest]) { p.setDefaultTimeout(10000); p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,120))}); }
async function openLobby(p){await p.goto('http://127.0.0.1:4175/#/arcade/karting',{waitUntil:'domcontentloaded'}); await p.waitForTimeout(900); await p.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent?.includes('Race online')); b?.click();}); await p.waitForTimeout(500);}
await openLobby(host); await host.getByLabel('Your name').fill('Alex'); await host.getByRole('button',{name:/Create room/}).click({force:true}); await host.waitForTimeout(1800);
const t=await host.locator('body').innerText(); const code=(t.match(/\b[A-Z2-9]{5}\b/g)||[]).find(x=>x.length===5); console.log('CODE',code);
// choose 1 lap
const lap1=host.getByRole('button',{name:'1 lap'}); if(await lap1.count()) await lap1.click({force:true});
await openLobby(guest); await guest.getByLabel('Your name').fill('Sam'); await guest.getByLabel('Room code').fill(code||''); await guest.getByRole('button',{name:/^Join$/}).click({force:true}); await guest.waitForTimeout(3500);
await host.getByRole('button',{name:/Start the race/}).click({force:true}); await host.waitForTimeout(3800);
console.log('STARTED', (await host.locator('body').innerText()).slice(-180), '|', (await guest.locator('body').innerText()).slice(-120));
for(let i=0;i<45;i++){
  await host.keyboard.press(String((i%4)+1)); await guest.keyboard.press(String((i%4)+1));
  await host.keyboard.down('KeyW'); await guest.keyboard.down('KeyW');
  if(i%4===0){await host.keyboard.press('KeyD'); await guest.keyboard.press('KeyD');}
  await host.waitForTimeout(1000); await guest.waitForTimeout(80);
  const hb=await host.locator('body').innerText(); const gb=await guest.locator('body').innerText();
  if(hb.includes('RUN COMPLETE')||gb.includes('RUN COMPLETE')){console.log('FINISHED at',i); break;}
}
await host.keyboard.up('KeyW'); await guest.keyboard.up('KeyW');
console.log('HOST END',(await host.locator('body').innerText()).slice(-600));
console.log('GUEST END',(await guest.locator('body').innerText()).slice(-600));
await browser.close();
