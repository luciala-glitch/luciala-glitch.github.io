const steps=[
  {label:'STEP 01 · HOME',title:'Begin with the driver’s intent.',body:'Choose Drive mode on the center display. The system starts from an action the driver already understands.',target:'Select Drive mode',aria:'Select Drive mode',x:'49.1%',y:'35.4%',w:'6%',h:'9%'},
  {label:'STEP 02 · TRAILER DETECTED',title:'Offer the next relevant action.',body:'The connected trailer appears in context. Open its saved profile to continue without rebuilding the setup.',target:'Open profile',aria:'Open the saved trailer profile',x:'48.7%',y:'39.3%',w:'7.2%',h:'5.4%'},
  {label:'STEP 03 · PRE-FLIGHT CHECK',title:'One unresolved item gets priority.',body:'Passing checks remain visible and quiet. The brake adjustment is the only warning competing for attention.',target:'Start towing',aria:'Start towing',x:'59.3%',y:'53.3%',w:'9.2%',h:'5.2%'},
  {label:'STEP 04 · DRIVING STATE',title:'Carry the mode into the cluster.',body:'Tow Mode is now active where the driver needs it. The center display can recede while the driving state remains clear.',target:'',aria:'',x:'0',y:'0',w:'0',h:'0'}
];
let current=0;
const images=[...document.querySelectorAll('.cockpit-state')];
const hotspot=document.querySelector('#hotspot');
const stamp=document.querySelector('#complete-stamp');
const previous=document.querySelector('#previous');
const next=document.querySelector('#next');
const dots=[...document.querySelectorAll('[data-step]')];
function showStep(index){
  current=Math.max(0,Math.min(steps.length-1,index));
  const s=steps[current];
  images.forEach((img,i)=>img.classList.toggle('active',i===current));
  document.querySelector('#step-current').textContent=String(current+1).padStart(2,'0');
  document.querySelector('#step-label').textContent=s.label;
  document.querySelector('#step-title').textContent=s.title;
  document.querySelector('#step-body').textContent=s.body;
  dots.forEach((dot,i)=>{dot.classList.toggle('active',i===current);dot.setAttribute('aria-current',i===current?'step':'false')});
  previous.disabled=current===0;
  next.textContent=current===steps.length-1?'Restart ↺':'Next step →';
  hotspot.hidden=current===steps.length-1;
  stamp.hidden=current!==steps.length-1;
  if(current<steps.length-1){
    hotspot.style.setProperty('--x',s.x);hotspot.style.setProperty('--y',s.y);hotspot.style.setProperty('--w',s.w);hotspot.style.setProperty('--h',s.h);
    hotspot.setAttribute('aria-label',s.aria);document.querySelector('#hotspot-label').textContent=s.target;
  }
}
hotspot.addEventListener('click',()=>showStep(current+1));
previous.addEventListener('click',()=>showStep(current-1));
next.addEventListener('click',()=>showStep(current===steps.length-1?0:current+1));
dots.forEach(dot=>dot.addEventListener('click',()=>showStep(Number(dot.dataset.step))));
document.addEventListener('keydown',event=>{if(event.key==='ArrowRight')showStep(current===steps.length-1?0:current+1);if(event.key==='ArrowLeft')showStep(current-1)});
document.querySelector('#fullscreen').addEventListener('click',()=>{const stage=document.querySelector('#cockpit-stage');if(!document.fullscreenElement)stage.requestFullscreen?.();else document.exitFullscreen?.()});
const journey=document.querySelector('#journey');
const sticky=document.querySelector('.cinematic-sticky');
function updateJourney(){
  const rect=journey.getBoundingClientRect();
  const distance=journey.offsetHeight-innerHeight;
  const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,distance)));
  sticky.style.setProperty('--journey',progress.toFixed(4));
}
let ticking=false;
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{updateJourney();ticking=false});ticking=true}},{passive:true});
addEventListener('resize',updateJourney);
updateJourney();showStep(0);
