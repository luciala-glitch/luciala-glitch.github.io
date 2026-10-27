const codeSamples={
  dashboard:{caption:'PRIORITY DASHBOARD STATE',output:'Priority ranked<br><strong>Action owner shown</strong>',code:`const rankedProjects = projects
  .map(project => ({
    ...project,
    score: urgency(project) + conditionRisk(project)
  }))
  .toSorted((a, b) => b.score - a.score);

function selectProject(id) {
  state.selectedId = id;
  renderLinkedViews(state);
}`},
  gm:{caption:'GUIDED TOWING STATE MACHINE',output:'Tow Mode active<br><strong>Flow complete</strong>',code:`const steps = ['home', 'detected', 'profile', 'tow'];
let current = 0;

function showStep(next) {
  current = Math.max(0, Math.min(steps.length - 1, next));
  screens.forEach((screen, index) => {
    screen.classList.toggle('active', index === current);
  });
  guide.textContent = instructions[current];
}`},
  fablab:{caption:'TRAINING-GATED BOOKING STATE',output:'Training verified<br><strong>Booking confirmed</strong>',code:`const trained = id => state.training[id] === 'done';

function bookingStatus(booking) {
  return trained(booking.machine) ? 'Confirmed'
    : 'Pending · training required';
}

function passQuiz(machineId) {
  state.training[machineId] = 'done';
  // Pending bookings for this machine confirm themselves
  showModal('verified', machineId);
}`},
  interface:{caption:'FILTERABLE PORTFOLIO INTERFACE',output:'Priority surfaced<br><strong>Review first</strong>',code:`const visible = projects
  .filter(project => activeFilter === 'all'
    || project.tags.includes(activeFilter));

visible.forEach((project, index) => {
  project.card.style.setProperty('--order', index);
  project.card.hidden = false;
});

status.textContent = \`\${visible.length} projects shown\`;`},
  measurement:{caption:'SIGNED-AXIS BROWSER MEASUREMENT',output:'Geometry checked<br><strong>44.1% PBL</strong>',code:`function signedProjection(point, origin, axis) {
  const dx = point.x - origin.x;
  const dy = point.y - origin.y;
  return dx * axis.x + dy * axis.y;
}

const rootLength = signedProjection(apex, crown, longAxis);
const boneLevel  = signedProjection(bone, crown, longAxis);

if (rootLength <= 0) throw new Error('Check landmarks');
return (boneLevel / rootLength) * 100;`},
  sequence:{caption:'SYNTHETIC EVENT SEQUENCE EXPLORER',output:'Sequence filtered<br><strong>3 runs match</strong>',code:`const publicRuns = syntheticRuns
  .filter(run => filters.every(rule => rule(run)))
  .map(run => ({
    id: run.fictionalId,
    firstEvent: run.events.toSorted(byTime)[0],
    gapToOutcome: minutes(run.outcomeAt - run.eventAt)
  }));

renderTimeline(publicRuns);
// Synthetic values only — no internal thresholds.`}
};
function highlight(code){return code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/(\/\/.*)$/gm,'<span class="token-comment">$1</span>').replace(/\b(const|let|return|if|throw|new|function)\b/g,'<span class="token-key">$1</span>').replace(/\b(filter|forEach|includes|textContent|map|toSorted|renderTimeline|signedProjection|setProperty)\b/g,'<span class="token-fn">$1</span>').replace(/('(?:[^']*)'|`(?:[^`]*)`)/g,'<span class="token-string">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g,'<span class="token-num">$1</span>')}
function selectCode(key){const sample=codeSamples[key]||codeSamples.interface;document.querySelectorAll('[data-code]').forEach(button=>{const active=button.dataset.code===key;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});document.querySelectorAll('#hero-code,#lab-code').forEach(node=>node.innerHTML=highlight(sample.code));const output=document.querySelector('#code-output');if(output)output.innerHTML=sample.output;const caption=document.querySelector('#code-caption');if(caption)caption.textContent=sample.caption;document.body.dataset.code=key}
document.querySelectorAll('[data-code]').forEach(button=>button.addEventListener('click',()=>selectCode(button.dataset.code)));
const copyButton=document.querySelector('#copy-code');if(copyButton)copyButton.addEventListener('click',async()=>{const key=document.body.dataset.code||'interface';try{await navigator.clipboard.writeText(codeSamples[key].code);copyButton.textContent='Copied ✓';setTimeout(()=>copyButton.textContent='Copy excerpt',1600)}catch{copyButton.textContent='Select code to copy'}});
document.querySelectorAll('.interactive-surface,.project-art').forEach(surface=>surface.addEventListener('pointermove',event=>{const box=surface.getBoundingClientRect();surface.style.setProperty('--mx',`${((event.clientX-box.left)/box.width*100).toFixed(1)}%`);surface.style.setProperty('--my',`${((event.clientY-box.top)/box.height*100).toFixed(1)}%`)}));
document.querySelectorAll('.project').forEach((card,index)=>{const project=projects[index];if(!project)return;const info=card.querySelector('.project-info>div');if(info&&!info.querySelector('.project-tags')){const tags=document.createElement('div');tags.className='project-tags';tags.innerHTML=project.tags.map(tag=>`<span>${tag}</span>`).join('');info.append(tags)}});
const caseHost=document.querySelector('#case');if(caseHost){const id=new URLSearchParams(location.search).get('id');const key={gear:'dashboard',silverado:'gm',northern:'measurement',oxylus:'sequence',fablab:'fablab'}[id];const demo=caseHost.querySelector('.demo-section');if(key&&demo){const sample=codeSamples[key];const section=document.createElement('section');section.className='code-proof';section.innerHTML=`<div class="code-proof-copy"><div><p class="eyebrow">BUILT, NOT JUST DRAWN</p><h2>The interaction has rules.</h2><p>${id==='oxylus'?'This public excerpt uses synthetic runs and newly written logic. No company source, thresholds, or operational data are included.':'A selected public excerpt from the working portfolio prototype.'}</p></div><small>${sample.caption} · PUBLIC EXCERPT</small></div><pre><code>${highlight(sample.code)}</code></pre>`;demo.before(section)}}
selectCode('interface');
