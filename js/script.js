/* Serving With Honor — shared behavior */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= EDIT THIS BLOCK ================= */
const CONFIG={
  business:'Serving With Honor LLC',
  phone:'(689) 201-7444',phoneRaw:'+16892017444',
  email:'servingwithhonorllc@gmail.com',          // receives every cleaning request
  location:'Davenport, FL',
  paymentNote:'Payment is due on the day of service. Accepted methods: [add your methods here].',
  taxRate:0,                                       // e.g. 0.07 for 7%
  // EmailJS sends BOTH emails (invoice to client, request to you). See README.md for the 5-minute setup.
  emailjs:{serviceId:'',publicKey:'',clientTemplateId:'',businessTemplateId:''}
};
const PRICE={ // starting prices come from the flier. Everything else is a placeholder to edit.
  base:{standard:125,deep:155},extraBed:{standard:20,deep:25},extraBath:{standard:20,deep:25},bathOnly:{standard:65,deep:80},
  sqft:[['Under 1,200 sq ft',1],['1,200 to 1,800 sq ft',1.12],['1,800 to 2,500 sq ft',1.28],['2,500 to 3,500 sq ft',1.5],['3,500+ sq ft',1.75]],
  prop:{house:['Private house',1],apartment:['Apartment',.95],airbnb:['Airbnb / short-term rental',1.05],salon:['Salon',1.1],commercial:['Commercial building',0]},
  freq:{once:['One-time',0],weekly:['Weekly',.15],biweekly:['Bi-weekly',.10],monthly:['Monthly',.05]},
  addons:{fridge:['Inside fridge',35],oven:['Inside oven',35],windows:['Interior windows',50],cabinets:['Inside cabinets',40],laundry:['Laundry (wash and fold)',25],pets:['Heavy pet hair',30],patio:['Balcony or patio',25],walls:['Wall spot cleaning',40]},
  svcName:{standard:'Standard Cleaning',deep:'Deep Cleaning',bathroom:'Bathroom-Only Cleaning'}
};
/* =================================================== */
const $$$=n=>'$'+Number(n).toFixed(2).replace(/\.00$/,'');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* price engine shared by every calculator */
function estimate(o){
  const L=[];let sub=0;const tier=o.svc==='deep'?'deep':'standard';
  if(o.prop==='commercial')return{custom:true,lines:[],sub:0,disc:0,tax:0,total:0};
  const pm=PRICE.prop[o.prop][1];
  if(o.svc==='bathroom'){const p=PRICE.bathOnly[o.bathTier||'standard'];const amt=Math.round(p*o.bath*pm);L.push([`${PRICE.svcName.bathroom}, ${o.bathTier==='deep'?'deep':'standard'} (${o.bath} bathroom${o.bath>1?'s':''})`,amt]);sub+=amt}
  else{const bd=Math.max(0,o.bed-2),bt=Math.max(0,o.bath-1),m=PRICE.sqft[o.sq][1];
    const base=Math.round(PRICE.base[tier]*pm*m);L.push([`${PRICE.svcName[o.svc]}, ${PRICE.prop[o.prop][0]}, ${PRICE.sqft[o.sq][0]}`,base]);sub+=base;
    if(bd){const a=Math.round(bd*PRICE.extraBed[tier]*pm);L.push([`Extra bedrooms (${bd})`,a]);sub+=a}
    if(bt){const a=Math.round(bt*PRICE.extraBath[tier]*pm);L.push([`Extra bathrooms (${bt})`,a]);sub+=a}}
  (o.addons||[]).forEach(k=>{L.push([PRICE.addons[k][0],PRICE.addons[k][1]]);sub+=PRICE.addons[k][1]});
  const dp=o.svc==='standard'?PRICE.freq[o.freq||'once'][1]:0;const disc=Math.round(sub*dp);
  const tax=Math.round((sub-disc)*CONFIG.taxRate*100)/100;
  return{lines:L,sub,disc,discPct:dp,tax,total:sub-disc+tax}}

/* header, menus, promo */
const hd=$('header.top');addEventListener('scroll',()=>hd.classList.toggle('scrolled',scrollY>8),{passive:true});
$('.burger')?.addEventListener('click',e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)});
$('.dd>button')?.addEventListener('click',e=>{const d=e.currentTarget.parentElement;d.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',d.classList.contains('open'))});
$('.promo button')?.addEventListener('click',()=>$('.promo').remove());
$$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());

/* headline reveal */
$$('[data-split]').forEach(el=>{let i=0;const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t.trim()){f.append(t);return}const o=document.createElement('span');o.className='w';o.innerHTML=`<span class="${c.parentElement.classList.contains('gl')?'gl-w':''}" style="--i:${i++}">${t}</span>`;f.append(o)});c.replaceWith(f)}else if(!c.classList?.contains('script'))walk(c)})};walk(el)});
function count(el){const to=parseFloat(el.dataset.to),t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/1500),e=1-Math.pow(1-k,3);el.textContent=Math.round(to*e)+(el.dataset.suf||'');if(k<1)requestAnimationFrame(f)})(t0)}
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('show');if(x.target.dataset.to)count(x.target);io.unobserve(x.target)}}),{threshold:.15});
$$('.rv,[data-to]').forEach(e=>io.observe(e));
if(!reduce&&matchMedia('(hover:hover)').matches)$$('.btn').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.16}px,${(e.clientY-r.top-r.height/2)*.26}px)`});b.addEventListener('pointerleave',()=>b.style.transform='')});

/* hero: drifting gold dust, twinkling diamonds, cursor spotlight and sparkle trail */
const cv=$('#fx');
if(cv&&!reduce){
  const c=cv.getContext('2d'),host=cv.parentElement,dpr=Math.min(devicePixelRatio||1,2);let W,H,dust=[],gems=[],trail=[],on=true,last=0,mx=-999,my=-999;
  function size(){const r=cv.getBoundingClientRect();W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);
    dust=Array.from({length:Math.round(W/9)},()=>({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*2.6,v:.1+Math.random()*.4,p:Math.random()*6.28,a:.2+Math.random()*.6}));
    gems=Array.from({length:Math.round(W/70)},()=>({x:Math.random()*W,y:Math.random()*H,s:5+Math.random()*10,p:Math.random()*6.28,sp:.8+Math.random()*1.6}))}
  size();addEventListener('resize',size);
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;host.style.setProperty('--mx',mx+'px');host.style.setProperty('--my',my+'px');
    if(Math.random()<.5)trail.push({x:mx,y:my,vx:(Math.random()-.5)*1.4,vy:Math.random()*1.2+.2,l:1,s:2+Math.random()*4})});
  new IntersectionObserver(e=>on=e[0].isIntersecting).observe(cv);
  const star=(x,y,s,a)=>{c.save();c.translate(x,y);c.fillStyle=`rgba(255,240,190,${a})`;c.beginPath();for(let i=0;i<8;i++){const r=i%2?s*.18:s;c.lineTo(Math.cos(i*Math.PI/4)*r,Math.sin(i*Math.PI/4)*r)}c.closePath();c.fill();c.restore()};
  (function frame(t){requestAnimationFrame(frame);if(!on||t-last<16)return;last=t;c.clearRect(0,0,W,H);const T=t/1000;
    for(const d of dust){d.y-=d.v;d.x+=Math.sin(T+d.p)*.3;if(d.y<-5){d.y=H+5;d.x=Math.random()*W}
      const near=Math.hypot(d.x-mx,d.y-my)<140?1.8:1;c.fillStyle=`rgba(232,196,98,${Math.min(1,d.a*near*(.6+.4*Math.sin(T*2+d.p)))})`;c.beginPath();c.arc(d.x,d.y,d.r*near,0,6.3);c.fill()}
    for(const g of gems)star(g.x,g.y,g.s,Math.max(0,Math.sin(T*g.sp+g.p))*.95);
    trail=trail.filter(p=>p.l>0);for(const p of trail){p.x+=p.vx;p.y+=p.vy;p.l-=.03;star(p.x,p.y,p.s*p.l+1,p.l)}
  })(0)}

/* mini calculator (home + pricing) */
const mc=$('#mc');
if(mc){let svc='standard',freq='once';const f=id=>$('#mc-'+id);
  f('sq').innerHTML=PRICE.sqft.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('');
  f('prop').innerHTML=Object.entries(PRICE.prop).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('');
  function run(){const o={svc,prop:f('prop').value,bed:+f('bed').value,bath:+f('bath').value,sq:+f('sq').value,freq};
    f('bv').textContent=o.bed;f('bav').textContent=o.bath;$('#mc-freqwrap').style.display=svc==='standard'?'block':'none';$('#mc-bedwrap').style.display=svc==='bathroom'?'none':'block';$('#mc-sqwrap').style.display=svc==='bathroom'?'none':'block';
    const e=estimate(o);f('price').textContent=e.custom?'Custom quote':$$$(e.total);
    f('go').href=`book.html?svc=${svc}&prop=${o.prop}&bed=${o.bed}&bath=${o.bath}&sq=${o.sq}&freq=${freq}#form`}
  $$('#mc-svc button').forEach(b=>b.onclick=()=>{svc=b.dataset.v;$$('#mc-svc button').forEach(x=>x.classList.toggle('on',x===b));run()});
  $$('#mc-freq button').forEach(b=>b.onclick=()=>{freq=b.dataset.v;$$('#mc-freq button').forEach(x=>x.classList.toggle('on',x===b));run()});
  ['prop','bed','bath','sq'].forEach(k=>f(k).addEventListener('input',run));run()}

/* before / after sliders + gallery filter */
$$('.ba img').forEach(i=>i.addEventListener('error',()=>i.remove()));
$$('.ba').forEach(b=>{const i=$('input',b);i.oninput=()=>b.style.setProperty('--p',i.value+'%')});
$$('.filters button').forEach(b=>b.onclick=()=>{$$('.filters button').forEach(x=>x.classList.toggle('on',x===b));$$('.gal figure').forEach(f=>f.classList.toggle('hide',b.dataset.f!=='all'&&f.dataset.c!==b.dataset.f))});

/* ================= BOOKING WIZARD + INVOICE ================= */
const bf=$('#form');
function invoiceHTML(d,biz){
  const e=d.est,row=(a,b,s='')=>`<tr><td style="padding:8px 0;border-bottom:1px solid #eee;${s}">${a}</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;${s}">${b}</td></tr>`;
  const lines=e.lines.map(l=>row(esc(l[0]),$$$(l[1]))).join('')+(e.disc?row(`Recurring discount (${Math.round(e.discPct*100)}%)`,'−'+$$$(e.disc),'color:#2e7d32'):'')+(e.tax?row('Tax',$$$(e.tax)):'');
  const extra=biz?`<h3 style="margin:22px 0 6px;font-size:15px">Client details</h3><p style="margin:0;font-size:14px;line-height:1.6">Phone: ${esc(d.phone)}<br>Email: ${esc(d.email)}<br>Pets: ${esc(d.pets)}<br>Access: ${esc(d.access||'Not provided')}<br>Notes: ${esc(d.notes||'None')}</p>`:'';
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#111;background:#fff;border:1px solid #e5d9b0;border-radius:10px;overflow:hidden">
<div style="background:#0b1110;padding:22px 26px;color:#f6e3a1"><div style="font-size:22px;letter-spacing:3px;font-weight:bold">SERVING WITH HONOR</div><div style="font-size:12px;letter-spacing:2px;color:#d9b24c">CLEANING SERVICES · ${biz?'NEW CLEANING REQUEST':'INVOICE'}</div></div>
<div style="padding:24px 26px"><table style="width:100%;font-size:14px"><tr><td><b>${biz?'Request':'Invoice'} #${esc(d.no)}</b><br>Issued: ${esc(d.issued)}</td><td style="text-align:right"><b>Service date</b><br>${esc(d.dateLabel)}<br>${esc(d.time)}</td></tr></table>
<p style="font-size:14px;margin:18px 0 4px"><b>${biz?'Client':'Billed to'}</b><br>${esc(d.name)}<br>${esc(d.addr)}, ${esc(d.city)} ${esc(d.zip)}</p>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:14px"><tr><th style="text-align:left;padding:8px 0;border-bottom:2px solid #d9b24c">Description</th><th style="text-align:right;padding:8px 0;border-bottom:2px solid #d9b24c">Amount</th></tr>${lines}
<tr><td style="padding:12px 0;font-size:16px"><b>Estimated total</b></td><td style="padding:12px 0;text-align:right;font-size:20px"><b>${$$$(e.total)}</b></td></tr></table>
<p style="font-size:12px;color:#555;line-height:1.5">${esc(CONFIG.paymentNote)} This is an estimate based on the details provided. Any change in scope will be confirmed with you before work begins.</p>${extra}
<p style="font-size:13px;margin-top:22px;border-top:1px solid #eee;padding-top:14px">Questions? Call <b>${esc(CONFIG.phone)}</b> or email ${esc(CONFIG.email)}<br>Serving With Honor LLC · ${esc(CONFIG.location)} · Because you deserve to come home to clean.</p></div></div>`}

async function sendMail(templateId,params){const c=CONFIG.emailjs;
  const r=await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:c.serviceId,template_id:templateId,user_id:c.publicKey,template_params:params})});
  if(!r.ok)throw new Error(await r.text());}

if(bf){
  const S={svc:'standard',freq:'once'};let step=1;const g=id=>$('#'+id),boxes=$$('.stepbox');
  g('b-sq').innerHTML=PRICE.sqft.map((s,i)=>`<option value="${i}">${s[0]}</option>`).join('');
  g('b-prop').innerHTML=Object.entries(PRICE.prop).map(([k,v])=>`<option value="${k}">${v[0]}</option>`).join('');
  g('b-addons').innerHTML=Object.entries(PRICE.addons).map(([k,v])=>`<label class="addon" style="text-transform:none;letter-spacing:0;color:inherit;font-weight:500;font-size:.92rem;margin:8px 0"><input type="checkbox" value="${k}">${v[0]}<span>+${$$$(v[1])}</span></label>`).join('');
  const d0=new Date();d0.setDate(d0.getDate()+1);g('b-date').min=d0.toISOString().slice(0,10);
  const p=new URLSearchParams(location.search);
  if(p.get('svc')&&PRICE.svcName[p.get('svc')])S.svc=p.get('svc');if(PRICE.freq[p.get('freq')])S.freq=p.get('freq');
  if(PRICE.prop[p.get('prop')])g('b-prop').value=p.get('prop');['bed','bath','sq'].forEach(k=>{if(p.get(k))g('b-'+k).value=p.get(k)});
  $$('#b-svc button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.svc));$$('#b-freq button').forEach(b=>b.classList.toggle('on',b.dataset.v===S.freq));
  const data=()=>({svc:S.svc,freq:S.freq,prop:g('b-prop').value,bed:+g('b-bed').value,bath:+g('b-bath').value,sq:+g('b-sq').value,addons:$$('#b-addons input:checked').map(i=>i.value),bathTier:g('b-bt').value});
  function sum(){const o=data(),e=estimate(o);g('s-lines').innerHTML=e.custom?'<div><span>Commercial buildings are quoted after a walk-through.</span></div>':e.lines.map(l=>`<div><span>${esc(l[0])}</span><span>${$$$(l[1])}</span></div>`).join('')+(e.disc?`<div style="color:var(--gold2)"><span>Recurring discount</span><span>−${$$$(e.disc)}</span></div>`:'')+(e.tax?`<div><span>Tax</span><span>${$$$(e.tax)}</span></div>`:'');
    g('s-total').textContent=e.custom?'Custom quote':$$$(e.total);g('b-freqwrap').style.display=S.svc==='standard'?'block':'none';g('b-sizewrap').style.display=g('b-sqwrap').style.display=S.svc==='bathroom'?'none':'block';g('b-btwrap').style.display=S.svc==='bathroom'?'block':'none';return e}
  $$('#b-svc button').forEach(b=>b.onclick=()=>{S.svc=b.dataset.v;$$('#b-svc button').forEach(x=>x.classList.toggle('on',x===b));sum()});
  $$('#b-freq button').forEach(b=>b.onclick=()=>{S.freq=b.dataset.v;$$('#b-freq button').forEach(x=>x.classList.toggle('on',x===b));sum()});
  bf.addEventListener('input',sum);
  function show(n){step=n;boxes.forEach((b,i)=>b.classList.toggle('on',i===n-1));$$('.wiz i').forEach((i,k)=>i.classList.toggle('on',k<n));if(n===4)review();scrollTo({top:$('#form').offsetTop-90,behavior:'smooth'})}
  function valid(n){const need=n===3?['b-date','b-time','b-n','b-email','b-phone','b-addr','b-city','b-zip']:[];for(const id of need){const el=g(id);if(!el.value.trim()||(el.type==='email'&&!el.checkValidity())){el.focus();el.reportValidity?.();return false}}return true}
  $$('[data-next]').forEach(b=>b.onclick=()=>{if(valid(step))show(step+1)});$$('[data-prev]').forEach(b=>b.onclick=()=>show(step-1));
  function collect(){const o=data(),e=estimate(o),dt=new Date(g('b-date').value+'T12:00');
    return{...o,est:e,no:'SWH-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.floor(1000+Math.random()*9000),issued:new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),
    dateLabel:dt.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'}),time:g('b-time').value,name:g('b-n').value.trim(),email:g('b-email').value.trim(),phone:g('b-phone').value.trim(),addr:g('b-addr').value.trim(),city:g('b-city').value.trim(),zip:g('b-zip').value.trim(),pets:g('b-pets').value,access:g('b-access').value.trim(),notes:g('b-notes').value.trim()}}
  function review(){const d=collect();g('rev').innerHTML=`<div class="inv">${invoiceHTML(d,false)}</div>`}
  bf.addEventListener('submit',async ev=>{ev.preventDefault();if(g('b-hp').value)return;if(!g('b-terms').checked){g('b-terms').focus();return}
    const d=collect(),btn=g('b-send'),st=g('b-status');btn.disabled=true;btn.textContent='Sending…';
    const c=CONFIG.emailjs,ready=c.serviceId&&c.publicKey&&c.clientTemplateId&&c.businessTemplateId;let sent=false,msg='';
    if(ready){try{const subj=n=>`${n} #${d.no} · ${PRICE.svcName[d.svc]} on ${d.dateLabel}`;
      const rs=await Promise.allSettled([sendMail(c.clientTemplateId,{to_email:d.email,to_name:d.name,subject:subj('Your Serving With Honor invoice'),html:invoiceHTML(d,false),reply_to:CONFIG.email,from_name:CONFIG.business}),
        sendMail(c.businessTemplateId,{to_email:CONFIG.email,to_name:CONFIG.business,subject:subj('New cleaning request'),html:invoiceHTML(d,true),reply_to:d.email,from_name:d.name})]);
      sent=rs.every(r=>r.status==='fulfilled');msg=sent?`We emailed your invoice to ${esc(d.email)} and sent your request to our team.`:'Your request was received, but one email did not go through. Please call us to confirm.'}catch(x){msg='We could not send the emails. Please call us to confirm.'}}
    else msg='Email sending is not connected yet (see README.md). Use the buttons below to send this request manually.';
    boxes.forEach(b=>b.classList.remove('on'));g('done').style.display='block';$$('.wiz').forEach(w=>w.style.display='none');
    g('done-msg').innerHTML=msg;g('done-inv').innerHTML=`<div class="inv">${invoiceHTML(d,false)}</div>`;
    const plain=encodeURIComponent(`New cleaning request ${d.no}\n\nName: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email}\nAddress: ${d.addr}, ${d.city} ${d.zip}\nService: ${PRICE.svcName[d.svc]} (${PRICE.prop[d.prop][0]}, ${d.bed} bed, ${d.bath} bath)\nDate: ${d.dateLabel}, ${d.time}\nAdd-ons: ${d.addons.map(a=>PRICE.addons[a][0]).join(', ')||'None'}\nEstimate: ${d.est.custom?'Custom quote':$$$(d.est.total)}\nPets: ${d.pets}\nAccess: ${d.access}\nNotes: ${d.notes}`);
    g('done-mail').href=`mailto:${CONFIG.email}?subject=${encodeURIComponent('Cleaning request '+d.no)}&body=${plain}`;g('done-mail').style.display=ready&&sent?'none':'inline-block';
    scrollTo({top:$('#done').offsetTop-100,behavior:'smooth'})});
  sum()}

/* quote popup: once per visit */
const md=$('#pop');
if(md&&!sessionStorage.getItem('popSeen')){const show=()=>{if(sessionStorage.getItem('popSeen'))return;sessionStorage.setItem('popSeen','1');md.classList.add('open');$('.x',md).focus()};
  setTimeout(show,30000);document.addEventListener('mouseout',e=>{if(e.clientY<=0&&e.relatedTarget===null)show()});
  md.addEventListener('click',e=>{if(e.target===md||e.target.classList.contains('x')||e.target.dataset.close!==undefined)md.classList.remove('open')});addEventListener('keydown',e=>{if(e.key==='Escape')md.classList.remove('open')})}
$$('[data-print]').forEach(b=>b.onclick=()=>print());

/* service-area text + contact form */
$('#area')?.addEventListener('submit',e=>{e.preventDefault();location.href=`sms:${CONFIG.phoneRaw}?&body=${encodeURIComponent('Hi Serving With Honor, do you serve '+$('#area-c').value+'?')}`});
$('#cform')?.addEventListener('submit',e=>{e.preventDefault();location.href=`mailto:${CONFIG.email}?subject=${encodeURIComponent('Website message from '+$('#c-n').value)}&body=${encodeURIComponent($('#c-m').value+'\n\nFrom: '+$('#c-n').value+' ('+$('#c-e').value+')')}`});
