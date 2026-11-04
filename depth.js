(() => {
  const hero=document.querySelector('.portfolio-hero');if(!hero)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,body=document.body;
  const syncHeader=()=>body.classList.toggle('hero-dark',scrollY<hero.offsetHeight*.86);
  syncHeader();addEventListener('scroll',syncHeader,{passive:true});
  let tx=0,ty=0,x=0,y=0,progress=0,raf=0;
  const paint=()=>{x+=(tx-x)*.07;y+=(ty-y)*.07;hero.style.setProperty('--mx',x.toFixed(3));hero.style.setProperty('--my',y.toFixed(3));hero.style.setProperty('--p',progress.toFixed(3));if(Math.abs(tx-x)>.002||Math.abs(ty-y)>.002)raf=requestAnimationFrame(paint);else raf=0};
  const requestPaint=()=>{if(!raf)raf=requestAnimationFrame(paint)};
  if(!reduced&&matchMedia('(pointer:fine)').matches){hero.addEventListener('pointermove',event=>{const r=hero.getBoundingClientRect();tx=Math.max(-1,Math.min(1,((event.clientX-r.left)/r.width-.5)*2));ty=Math.max(-1,Math.min(1,((event.clientY-r.top)/r.height-.5)*2));requestPaint()},{passive:true});hero.addEventListener('pointerleave',()=>{tx=0;ty=0;requestPaint()})}
  if(!reduced)addEventListener('scroll',()=>{const r=hero.getBoundingClientRect();progress=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height*.72)));requestPaint()},{passive:true});
})();
