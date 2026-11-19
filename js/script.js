(function(){
'use strict';
var doc=document, root=doc.documentElement, hdr=doc.querySelector('.site-header');
/* ---- шапка: тень, прогресс, активный пункт ---- */
var bar=doc.createElement('div');bar.className='progress';doc.body.appendChild(bar);
var links=[].slice.call(doc.querySelectorAll('.site-nav a')),
    secs=links.map(function(a){return doc.querySelector(a.getAttribute('href'))});
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
})();
