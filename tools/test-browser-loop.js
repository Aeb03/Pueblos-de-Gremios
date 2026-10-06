'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process'];
async function main(){
  const browser=await chromium.launch({headless:true,...(process.env.PG_BROWSER_EXECUTABLE?{executablePath:process.env.PG_BROWSER_EXECUTABLE,args}:{})});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
    await context.route('https://pueblos.test/**',route=>{
      const pathname=new URL(route.request().url()).pathname;
      const file=path.join(root,pathname==='/'?'index.html':pathname.slice(1));
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
      const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webmanifest')?'application/manifest+json':file.endsWith('.svg')?'image/svg+xml':'text/html';
      return route.fulfill({status:200,body:fs.readFileSync(file),contentType});
    });
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(()=>{let a=1989;Math.random=()=>{a|=0;a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};});
    await page.clock.install({time:new Date('2026-10-06T03:00:00Z')});
    await page.goto('https://pueblos.test/?prueba=nv1-3');
    await page.evaluate(()=>localStorage.setItem(MAIN_SAVE_KEY,JSON.stringify({untouched:true})));
    await page.locator('#foundationCityName').fill('Villa del Bosque');
    await page.locator('#foundCityBtn').click();
    const read=()=>page.evaluate(()=>JSON.parse(JSON.stringify(state)));
    const go=async screen=>{
      if(['smithy','carpenter','inn','guildHall','townHall','textile'].includes(screen)){
        await page.locator('[data-target="city"]').click();
        const buildings={smithy:'Herrería',carpenter:'Carpintería',inn:'Mesón',guildHall:'Sede del Gremio',townHall:'Ayuntamiento',textile:'Textilería'};
        await page.locator(`[data-building="${buildings[screen]}"]`).click();
      }else await page.locator(`[data-target="${screen}"]`).click();
    };
    const tab=async(shop,name)=>page.locator(`[data-manage-shop="${shop}"][data-manage-tab="${name}"]`).click();
    const tick=async()=>{await page.clock.runFor(31000);assert.equal(errors.length,0,errors.join('\n'));};
    const craft=async(shop,key)=>{await go(shop);await tab(shop,'production');await page.locator(`.business-management [data-world-recipe="${key}"]`).click();};
    const work=async()=>{await go('map');await tab('map','workers');for(const id of ['mapMineOuting','mapWoodOuting','mapHuntOuting'])if(await page.locator('#'+id).isEnabled())await page.locator('#'+id).click();};
    let s=await read();assert.equal(s.resources.coins,240);assert.equal(s.adventurers.length,3);assert.deepEqual(s.adventurers.map(n=>n.classKey),['warrior','explorer','healer']);
    assert.equal(await page.locator('#simulationTestTools').isVisible(),false);
    assert.equal(await page.locator('#resetWorldBtn').isVisible(),false);
    await go('guildHall');await page.locator('#guildRewardInput').fill('5');await page.locator('#publishGuildMission').click();
    s=await read();assert.equal(s.worldSystems.guild.missions[0].reward,5,'No resetear precio al perder foco');
    await craft('smithy','nails');await craft('smithy','scissors');
    await work();await tick();
    s=await read();assert.ok(s.worldSystems.clockMinutes>=10);assert.equal(s.worldSystems.production.stock.nails,1);assert.ok(s.resources.iron>5);assert.ok(s.worldSystems.guild.missions.some(m=>m.status==='accepted'));
    await tick();s=await read();assert.equal(s.worldSystems.production.stock.scissors,1);
    await craft('smithy','dagger');await tick();await go('smithy');await tab('smithy','store');
    const card=page.locator('.business-management .management-card').filter({has:page.locator('[data-manage-action="listing"]')}).first();
    await card.locator('[data-product-price]').fill('0');await card.locator('[data-manage-action="price"]').click();
    assert.ok((await page.locator('.screen.is-active .management-message').textContent()).includes('Precio permitido'));
    s=await read();assert.equal(s.worldSystems.production.goods.dagger[0].listed,false);
    await card.locator('[data-product-price]').fill(String(s.worldSystems.production.goods.dagger[0].referencePrice));
    await card.locator('[data-manage-action="listing"]').click();
    s=await read();assert.equal(s.worldSystems.production.goods.dagger[0].listed,true);
    for(let i=0;i<30;i++){
      s=await read();if(s.city.level>=2)break;
      await work();await tick();
      s=await read();if(Object.values(s.workers).some(w=>(w.stamina??100)<20)){
        await go('inn');await tab('inn','services');
        if(await page.locator('#toggleMaraInnRest').isEnabled())await page.locator('#toggleMaraInnRest').click();
        for(const key of ['logger','hunter']){const button=page.locator(`[data-manage-action="rest-worker"][data-worker="${key}"]`);if(!(await read()).workers[key].restingAtInn)await button.click();}
        await tick();await tick();await tick();await tick();
      }
    }
    s=await read();assert.equal(s.city.level>=2,true);assert.equal(s.adventurers.length,4);assert.ok(s.adventurers.some(n=>n.classKey==='mage'));console.log('BROWSER city Nv2 and Mago');
    await go('textile');assert.equal(await page.locator('#buildTextile').isEnabled(),true);await page.locator('#buildTextile').click();
    await tab('textile','tanning');await page.locator('[data-tan-origin="neutral"]').click();await tick();
    await go('textile');await tab('textile','production');await page.locator('#textileOriginSelect').selectOption('neutral');await page.locator('.business-management [data-world-recipe="leatherGloves"]').click();await tick();
    s=await read();assert.ok(s.worldSystems.production.goods.leatherGloves.length>0);
    for(let i=0;i<60;i++){
      s=await read();if(s.city.level>=3)break;
      await work();await tick();
      s=await read();if(Object.values(s.workers).some(w=>(w.stamina??100)<20)){
        await go('inn');await tab('inn','services');
        if(!s.workers.mara.restingAtInn&&await page.locator('#toggleMaraInnRest').isEnabled())await page.locator('#toggleMaraInnRest').click();
        for(const key of ['logger','hunter'])if(!s.workers[key].restingAtInn)await page.locator(`[data-manage-action="rest-worker"][data-worker="${key}"]`).click();
        await tick();await tick();await tick();await tick();
      }
    }
    s=await read();assert.equal(s.city.level,3);assert.equal(s.adventurers.length,5);assert.equal(s.worldSystems.textile.built,true);assert.ok(s.worldSystems.guild.completed>0);assert.ok(s.adventurers.some(n=>n.history.activities>0));
    console.log('BROWSER city Nv3, quinto residente, producción y Textilería');
    const ids=s.adventurers.map(n=>n.id),origin=s.adventurers.map(n=>n.originCityId);
    await page.reload();s=await read();assert.deepEqual(s.adventurers.map(n=>n.id),ids);assert.deepEqual(s.adventurers.map(n=>n.originCityId),origin);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem(MAIN_SAVE_KEY)).untouched),true);
    for(const screen of ['city','smithy','carpenter','inn','guildHall','townHall','map','kingdom']){
      await go(screen);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Scroll horizontal en '+screen);
    }
    await go('smithy');await tab('smithy','production');
    await page.screenshot({path:process.env.PG_BROWSER_SCREENSHOT||'/tmp/pueblos-g3-production.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('test-browser-loop: móvil 390×844, fundación→Nv3, guardado, tabs y economía OK');
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
