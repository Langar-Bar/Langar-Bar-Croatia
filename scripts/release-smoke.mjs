import { chromium } from 'playwright';

const base=process.env.RELEASE_SMOKE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const page=await ctx.newPage();
const failures=[];
const check=(ok,msg)=>{if(!ok)failures.push(msg);};

try{
  await page.goto(`${base}/index.html?storePreview=1`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(()=>localStorage.clear());
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(900);
  await page.locator('#popupLater,#closePopup').first().click({timeout:1500}).catch(()=>{});

  for(const id of ['home','order','menu','club','more']){
    await page.locator(`.bottom-nav [data-go="${id}"]`).click();
    await page.waitForTimeout(120);
    check(await page.locator(`#${id}`).evaluate(el=>el.classList.contains('active')),`Customer navigation failed: ${id}`);
  }

  await page.locator('.bottom-nav [data-go="home"]').click();
  await page.waitForTimeout(250);
  check(await page.locator('#popularStrip').evaluate(el=>getComputedStyle(el).display==='none'), 'Popular & Most Liked should be hidden before real engagement');
  check(await page.locator('#bestSellerStrip').evaluate(el=>getComputedStyle(el).display==='none'), 'Best Sellers should be hidden before real sales');
  const reviews=page.locator('.home-reviews');
  if(await reviews.count()) check(await reviews.evaluate(el=>getComputedStyle(el).display==='none'), 'What guests love should be hidden before real reviews');
  check(!(await page.locator('body').innerText()).includes('Add POS counts'), 'Test/admin placeholder Add POS counts is visible in customer app');

  await page.locator('#langBtn').click();
  await page.waitForTimeout(300);
  await page.locator('.bottom-nav [data-go="order"]').click();
  await page.waitForTimeout(200);
  const orderNote=(await page.locator('#orderModeNote').innerText()).trim();
  check(/No registration is needed/i.test(orderNote),`English language sync failed for order note: ${orderNote}`);
  const orderHead=(await page.locator('#order .section-head p').innerText()).trim();
  check(/Choose dine-in/i.test(orderHead),`English language sync failed for Order heading: ${orderHead}`);

  await page.locator('.bottom-nav [data-go="more"]').click();
  await page.waitForTimeout(200);
  const tel=page.locator('#more a[href^="tel:"]').first();
  check(await tel.count()>0,'Contact telephone link missing');
  if(await tel.count()){
    const color=await tel.evaluate(el=>getComputedStyle(el).color);
    check(!/rgb\(0, 0, 238\)|rgb\(0, 0, 255\)/.test(color),`Contact phone still browser-blue: ${color}`);
  }

  await page.locator('.bottom-nav [data-go="club"]').click();
  await page.waitForTimeout(300);
  check(await page.locator('#storeReferralCard').count()>0,'Referral card/QR module missing from Club');
  check(await page.locator('#storeClubDelete').count()>0,'Delete Account module missing from Club');

  const admin=await ctx.newPage();
  await admin.goto(`${base}/admin.html?storePreview=1`,{waitUntil:'domcontentloaded',timeout:30000});
  let found=false;
  for(let i=0;i<30;i+=1){
    if(await admin.locator('#adminCloudEmail').count()){found=true;break;}
    await admin.waitForTimeout(200);
  }
  check(found,'Admin email input was not created');
  if(found){
    const email=admin.locator('#adminCloudEmail').first(),pass=admin.locator('#adminCloudPassword').first();
    await email.fill('qa@example.com',{force:true}); await pass.fill('typing-test-123',{force:true});
    check(await email.inputValue()==='qa@example.com','Admin email field is not typeable');
    check(await pass.inputValue()==='typing-test-123','Admin password field is not typeable');
  }
  const modules=['dashboardPanel','quickPricePanel','menuPanel','ordersPanel','reservationsPanel','customersPanel','referralsPanel','notificationsPanel','experiencePanel','eventsPanel','sushiPanel','baristaPanel','knowledgePanel','feedbackPanel','galleryPanel','settingsPanel'];
  for(const id of modules){check(await admin.locator(`#${id}`).count()>0,`Admin module missing: ${id}`);}
  const darkButtons=admin.locator('button').filter({hasText:'Dashboard'});
  if(await darkButtons.count()){
    const col=await darkButtons.first().evaluate(el=>getComputedStyle(el).color);
    check(col==='rgb(255, 255, 255)'||col==='rgb(255, 244, 214)'||col==='rgb(245, 215, 139)',`Admin dark-green button contrast unexpected: ${col}`);
  }
  await admin.close();
} finally {
  await browser.close();
}

if(failures.length){
  console.error('\nRELEASE SMOKE FAILURES:'); failures.forEach(x=>console.error('- '+x)); process.exit(1);
}
console.log('Langar Bar release smoke test passed.');