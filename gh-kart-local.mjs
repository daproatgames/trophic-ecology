import { chromium } from 'playwright-core';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args:['--use-gl=angle','--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }); page.setDefaultTimeout(20000);
const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,200))});
await page.goto('https://daproatgames.github.io/trophic-ecology/#/arcade/karting',{waitUntil:'domcontentloaded',timeout:60000}); await page.waitForTimeout(1500);
// click local start directly
const start=page.getByRole('button',{name:/Start the race/}); console.log('START',await start.count());
await start.click({force:true}); await page.waitForTimeout(3600);
await page.keyboard.down('KeyW'); await page.waitForTimeout(2500); await page.keyboard.up('KeyW');
await page.keyboard.press('1'); await page.waitForTimeout(1200);
console.log((await page.locator('body').innerText()).slice(-900));
await page.screenshot({path:'/tmp/gh-kart-local.png'});
console.log('ERRORS',errors); await browser.close();
