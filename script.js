const screens=[...document.querySelectorAll(".screen")];
function show(id){screens.forEach(s=>s.classList.toggle("active",s.id===id));window.scrollTo({top:0,behavior:"smooth"});}

const music=document.getElementById("music");
document.getElementById("startBtn").addEventListener("click",()=>{
  show("mission");
  music.volume=.42;
});
document.getElementById("playBtn").addEventListener("click",()=>{show("game");renderMaze();});
document.getElementById("openLetterBtn").addEventListener("click",()=>{
  show("letter");
  const intro=document.getElementById("envelopeIntro");
  const letter=document.getElementById("animatedLetter");
  const env=document.querySelector(".envelope");
  intro?.classList.remove("hide-envelope");
  letter?.classList.remove("show-letter");
  env?.classList.remove("open");
});
document.getElementById("photosBtn").addEventListener("click",()=>show("photos"));

document.getElementById("envelopeBtn").addEventListener("click",()=>{
  const env=document.querySelector(".envelope");
  const intro=document.getElementById("envelopeIntro");
  const letter=document.getElementById("animatedLetter");

  env.classList.add("open");
  setTimeout(()=>intro.classList.add("hide-envelope"),950);
  setTimeout(()=>letter.classList.add("show-letter"),1250);
});

document.getElementById("finalBtn").addEventListener("click",()=>show("final"));

const phrases=[
  "Desde que llegaste, hasta los días normales se sienten distintos.",
  "Me gustan esos momentos pequeños que solo nosotros entendemos.",
  "Gracias por hacerme sonreír incluso cuando no lo intento.",
  "Cada recuerdo contigo se convierte en uno de mis favoritos.",
  "Todavía nos faltan muchísimas cosas por vivir.",
  "Encontraste seis recuerdos… pero mi favorito sigues siendo tú."
];

// 1 = pared, 0 = camino. 15 columnas x 11 filas.
const MAP=[
[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
[1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
[1,0,1,1,1,1,0,1,0,1,1,0,1,0,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
[1,1,1,1,0,1,1,1,1,0,1,1,1,0,1],
[1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
[1,0,1,1,1,1,1,0,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
[1,1,1,1,1,1,1,1,1,1,1,0,0,0,0]
];

const hearts=[
  {r:1,c:3},{r:1,c:9},{r:3,c:2},{r:5,c:8},{r:7,c:11},{r:10,c:12}
];
const start={r:0,c:0};
const exit={r:10,c:14};
let player={...start};
let collected=new Set();
let locked=false;

const maze=document.getElementById("maze");
const count=document.getElementById("heartCount");
const toast=document.getElementById("gameToast");

function key(r,c){return `${r},${c}`;}
function heartIndexAt(r,c){return hearts.findIndex(h=>h.r===r&&h.c===c);}
function isOpen(r,c){return r>=0&&r<MAP.length&&c>=0&&c<MAP[0].length&&MAP[r][c]===0;}

function renderMaze(){
  maze.innerHTML="";
  for(let r=0;r<MAP.length;r++){
    for(let c=0;c<MAP[0].length;c++){
      const cell=document.createElement("div");
      cell.className="cell "+(MAP[r][c]===1?"wall":"path");
      cell.dataset.r=r;cell.dataset.c=c;
      if(player.r===r&&player.c===c)cell.classList.add("player");
      const idx=heartIndexAt(r,c);
      if(idx>=0){
        cell.classList.add("heart");
        if(collected.has(idx))cell.classList.add("collected");
        cell.addEventListener("click",()=>collectAt(r,c,true));
      }
      if(exit.r===r&&exit.c===c){
        cell.classList.add("exit");
        if(collected.size===6)cell.classList.add("open");
      }
      maze.appendChild(cell);
    }
  }
  count.textContent=collected.size;
}

function move(dr,dc){
  if(locked)return;
  const nr=player.r+dr,nc=player.c+dc;
  if(isOpen(nr,nc)){
    player={r:nr,c:nc};
    renderMaze();
    const hi=heartIndexAt(nr,nc);
    if(hi>=0&&!collected.has(hi))toast.textContent="Hay un corazón aquí 💗 Presiona ESPACIO o tócalo.";
    else if(nr===exit.r&&nc===exit.c){
      if(collected.size===6){
        locked=true;
        toast.textContent="¡Encontraste los 6 recuerdos!";
        setTimeout(()=>{
          music.currentTime = 0;
          music.volume = .42;
          music.play().catch(()=>{});
          show("goal");
        },600);
      }
      else toast.textContent=`La salida se abrirá cuando encuentres los 6 💗 (${collected.size}/6)`;
    }else toast.textContent=collected.size===6?"La salida ya está iluminada ✨":"Sigue buscando…";
  }
}

function isAdjacentOrOn(r,c){
  const d=Math.abs(player.r-r)+Math.abs(player.c-c);
  return d<=1;
}
function collectAt(r,c,fromTouch=false){
  const idx=heartIndexAt(r,c);
  if(idx<0||collected.has(idx))return;
  if(!isAdjacentOrOn(r,c)){
    if(fromTouch)toast.textContent="Acércate un poquito más al corazón 💗";
    return;
  }
  collected.add(idx);
  toast.textContent=phrases[idx];
  renderMaze();
  if(collected.size===6){
    setTimeout(()=>{toast.textContent="✨ Ya encontraste todos. Busca la salida iluminada.";},1800);
  }
}
function collectNearby(){
  let found=false;
  hearts.forEach((h,i)=>{
    if(!collected.has(i)&&isAdjacentOrOn(h.r,h.c)&&!found){collectAt(h.r,h.c);found=true;}
  });
  if(!found)toast.textContent="No hay un corazón lo bastante cerca.";
}

window.addEventListener("keydown",(e)=>{
  if(!document.getElementById("game").classList.contains("active"))return;
  const map={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
  if(map[e.key]){e.preventDefault();move(...map[e.key]);}
  if(e.code==="Space"){e.preventDefault();collectNearby();}
});

document.querySelectorAll("[data-move]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const dir=btn.dataset.move;
    if(dir==="up")move(-1,0);
    if(dir==="down")move(1,0);
    if(dir==="left")move(0,-1);
    if(dir==="right")move(0,1);
  });
});
document.querySelector("[data-action='collect']").addEventListener("click",collectNearby);

// Tendedero
document.querySelectorAll(".photo-card").forEach(card=>{
  card.addEventListener("click",()=>{
    document.getElementById("photoCaption").textContent=card.dataset.caption;
  });
});

// Final
document.getElementById("yesBtn").addEventListener("click",()=>{
  document.getElementById("finalMessage").textContent="Entonces sigamos llenando el camino de recuerdos. 💗";
  for(let i=0;i<30;i++)setTimeout(spawnHeart,i*70);
});
document.getElementById("secretHeart").addEventListener("click",()=>{
  document.getElementById("secretMessage").classList.toggle("show");
});
function spawnHeart(){
  const h=document.createElement("div");
  h.className="floating-heart";
  h.textContent=Math.random()>.4?"💗":"✨";
  h.style.left=Math.random()*96+"vw";
  h.style.fontSize=(16+Math.random()*20)+"px";
  document.body.appendChild(h);
  setTimeout(()=>h.remove(),3800);
}

// Fondo de partículas
const canvas=document.getElementById("particles"),ctx=canvas.getContext("2d");
let dots=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;dots=Array.from({length:Math.min(70,Math.floor(innerWidth/12))},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.8+.3,s:Math.random()*.25+.08,a:Math.random()*.6+.1}));}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);for(const d of dots){d.y-=d.s;if(d.y<0)d.y=canvas.height;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,205,233,${d.a})`;ctx.fill();}requestAnimationFrame(draw);}
addEventListener("resize",resize);resize();draw();

renderMaze();
