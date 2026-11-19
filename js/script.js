(function(){
'use strict';
var doc=document, root=doc.documentElement, hdr=doc.querySelector('.site-header');
/* ---- шапка: тень, прогресс, активный пункт ---- */
var bar=doc.createElement('div');bar.className='progress';doc.body.appendChild(bar);
var links=[].slice.call(doc.querySelectorAll('.site-nav a')),
    secs=links.map(function(a){var h=a.getAttribute('href');return h&&h.charAt(0)==='#'?doc.querySelector(h):null});
function onScroll(){
  var y=window.scrollY,h=root.scrollHeight-window.innerHeight;
  hdr.classList.toggle('scrolled',y>10);
  bar.style.transform='scaleX('+(h>0?y/h:0)+')';
  var cur=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<window.innerHeight*.4)cur=i});
  links.forEach(function(a,i){a.classList.toggle('active',i===cur)});
}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();
/* ---- бургер ---- */
var burger=doc.querySelector('.burger');
function menu(open){hdr.classList.toggle('menu-open',open);burger.setAttribute('aria-expanded',open)}
burger.addEventListener('click',function(){menu(!hdr.classList.contains('menu-open'))});
links.forEach(function(a){a.addEventListener('click',function(){menu(false)})});
doc.addEventListener('keydown',function(e){if(e.key==='Escape')menu(false)});
/* ---- появление блоков при скролле ---- */
var items=[];
function tag(el,i,kind){el.setAttribute('data-reveal',kind||'');el.style.setProperty('--d',Math.min(i,5)*90+'ms');items.push(el)}
function collect(el,depth){
  var kids=[].slice.call(el.children);
  var multi=kids.length>=3&&depth<3&&/flex|grid/.test(getComputedStyle(el).display);
  if(multi){kids.forEach(function(k,i){
    if(k.children.length>=3&&depth<2&&/flex|grid/.test(getComputedStyle(k).display))collect(k,depth+1);
    else tag(k,i)})}
  else kids.forEach(function(k,i){tag(k,i)});
}
[].slice.call(doc.querySelectorAll('main>section')).forEach(function(sec,si){
  var inner=sec.children.length===1&&sec.firstElementChild.tagName==='DIV'?sec.firstElementChild:sec;
  var kids=[].slice.call(inner.children);
  kids.forEach(function(k,i){
    /* боковые колонки в двухколоночных блоках — слева / справа */
    if(inner===sec&&kids.length===2){tag(k,i,i?'right':'left');return}
    if(k.children.length>=3&&/flex|grid/.test(getComputedStyle(k).display)&&!k.querySelector(':scope>h2'))collect(k,1);
    else tag(k,0);
  });
});
/* картинки-заглушки — «zoom» */
items.forEach(function(el){if(el.getAttribute('role')==='img')el.setAttribute('data-reveal','zoom')});
doc.querySelector('footer')&&tag(doc.querySelector('footer'),0);
function done(el){setTimeout(function(){el.removeAttribute('data-reveal');el.classList.remove('is-in');el.style.removeProperty('--d')},1400+(parseInt(el.style.getPropertyValue('--d'))||0))}
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){var t=e.target;io.unobserve(t);requestAnimationFrame(function(){requestAnimationFrame(function(){t.classList.add('is-in');done(t)})})}
  })},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  items.forEach(function(el){io.observe(el)});
}else items.forEach(function(el){el.classList.add('is-in')});
/* ---- аккордеон FAQ: плавное раскрытие, одновременно открыт один ---- */
var faq=[].slice.call(doc.querySelectorAll('.faq-item'));
faq.forEach(function(item){
  var btn=item.querySelector('.faq-q');
  btn.addEventListener('click',function(){
    var open=!item.classList.contains('open');
    faq.forEach(function(o){o.classList.remove('open');o.querySelector('.faq-q').setAttribute('aria-expanded','false')});
    if(open){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
  });
});

/* ---- Google Analytics 4 + согласие на cookie ---- */
var GA_ID='G-XXXXXXXXXX'; /* ← вставьте Measurement ID из GA4 (Admin → Data streams) */
var KEY='cookie-consent',gaLoaded=false;
function store(v){try{if(v===undefined)return localStorage.getItem(KEY);localStorage.setItem(KEY,v)}catch(e){return null}}
function loadGA(){
  if(gaLoaded||!/^G-[A-Z0-9]{6,}$/.test(GA_ID)||GA_ID==='G-C1VYWG5LHX')return;
  gaLoaded=true;
  var s=doc.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;doc.head.appendChild(s);
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments)};
  gtag('js',new Date());gtag('config',GA_ID,{anonymize_ip:true});
}
function track(name,params){if(gaLoaded&&window.gtag)gtag('event',name,params||{})}
/* клик по WhatsApp → событие whatsapp_click */
doc.addEventListener('click',function(e){
  var a=e.target.closest&&e.target.closest('a[href*="wa.me"],a[href*="whatsapp.com"]');
  if(!a)return;
  var sec=a.closest('section[id],header,footer');
  track('whatsapp_click',{
    button_location:sec?(sec.id||sec.tagName.toLowerCase()):'page',
    link_text:(a.textContent||'').replace(/\s+/g,' ').trim().slice(0,60),
    page_path:location.pathname
  });
});
/* баннер согласия */
var banner;
function showBanner(){
  if(banner){banner.hidden=false;requestAnimationFrame(function(){banner.classList.add('show')});return}
  banner=doc.createElement('div');banner.className='cookie';banner.setAttribute('role','dialog');banner.setAttribute('aria-label','Cookie');
  banner.innerHTML='<p>Мы используем cookie и Google Analytics, чтобы понимать, какие разделы сайта полезны. Данные обезличены. <a href="privacy.html#sec6">Подробнее</a></p><div><button type="button" class="cookie-no">Отклонить</button><button type="button" class="cookie-yes">Принять</button></div>';
  doc.body.appendChild(banner);
  banner.querySelector('.cookie-yes').addEventListener('click',function(){store('granted');hideBanner();loadGA()});
  banner.querySelector('.cookie-no').addEventListener('click',function(){store('denied');hideBanner()});
  requestAnimationFrame(function(){requestAnimationFrame(function(){banner.classList.add('show')})});
}
function hideBanner(){banner.classList.remove('show');setTimeout(function(){banner.hidden=true},500)}
[].slice.call(doc.querySelectorAll('.cookie-open')).forEach(function(b){b.addEventListener('click',showBanner)});
var saved=store();
if(saved==='granted')loadGA();else if(!saved)setTimeout(showBanner,1200);
})();
