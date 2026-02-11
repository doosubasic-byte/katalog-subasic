const grid = document.getElementById("grid");
const q = document.getElementById("q");
const groupSel = document.getElementById("group");
const colsSel = document.getElementById("cols");

let items = [];
let filtered = [];
let prikazano = 0;
const KORAK = 30;

/* GRID */
function setCols(n){
  grid.style.gridTemplateColumns = `repeat(${n}, minmax(0,1fr))`;
  localStorage.setItem("cols", n);
}
setCols(localStorage.getItem("cols") || "3");
colsSel.value = localStorage.getItem("cols") || "3";
colsSel.onchange = () => setCols(colsSel.value);

/* BADGE */
function renderBadge(x){
  if(!x.oznaka) return "";

  const o = x.oznaka.toUpperCase();

  if(o==="AKCIJA")
    return `<div class="badge badge-akcija">AKCIJA ${x.akcija_postotak ? "- "+x.akcija_postotak+"%" : ""}</div>`;

  if(o==="NOVO")
    return `<div class="badge badge-novo">NOVO</div>`;

  if(o==="1+1")
    return `<div class="badge badge-11">1+1 GRATIS</div>`;

  if(o==="ISTEK")
    return `<div class="badge badge-istek">PRI ISTEKU</div>`;

  if(o==="STIZE")
    return `<div class="badge badge-stize">STIŽE USKORO</div>`;

  return "";
}

/* KLASA KARTICE */
function cardClass(x){
  if(!x.oznaka) return "card";
  if(x.oznaka.toUpperCase()==="AKCIJA") return "card card-akcija";
  if(x.oznaka.toUpperCase()==="1+1") return "card card-11";
  return "card";
}

/* UČITAJ JOŠ ARTIKALA (LAZY RENDER) */
function ucitajJos(){

  let kraj = Math.min(prikazano + KORAK, filtered.length);
  let html = "";

  for(let i = prikazano; i < kraj; i++){
    const x = filtered[i];

    html += `
      <div class="${cardClass(x)}">
        ${renderBadge(x)}
        <img class="img" loading="lazy" decoding="async" src="images/${x.slika}" onerror="this.src='no-image.png'">
        <div class="t">${x.naziv}</div>
        <div class="meta">
          Šifra: <b>${x.sifra}</b><br>
          VPC: <b>${x.vpc}</b> KM | MPC: <b>${x.mpc}</b> KM<br> 
          Pakovanje: <b>${x.pakovanje}</b>
        </div>
      </div>
    `;
  }

  grid.insertAdjacentHTML("beforeend", html);
  prikazano = kraj;
}

/* RENDER */
function render(){

  const term = q.value.toLowerCase();
  const g = groupSel.value;

  filtered = items
    .filter(x => x && x.sifra && x.naziv)
    .filter(x => (x.aktivno||"").toUpperCase()!=="NE")
    .filter(x => !g || x.grupa===g)
    .filter(x => !term || (`${x.naziv} ${x.sifra}`).toLowerCase().includes(term))
    .sort((a,b)=>Number(a.redoslijed||0)-Number(b.redoslijed||0));

  grid.innerHTML = "";
  prikazano = 0;
  ucitajJos();
}

/* SKROL DETEKCIJA */
window.addEventListener("scroll", () => {
  if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 500){
    ucitajJos();
  }
});

/* GRUPE */
function fillGroups(){
  const groups=[...new Set(items.map(x=>x.grupa).filter(Boolean))];
  groupSel.innerHTML=`<option value="">Sve grupe</option>`+
    groups.map(g=>`<option>${g}</option>`).join("");
}

q.oninput=render;
groupSel.onchange=render;

/* CSV */
Papa.parse("data/products.csv",{
  download:true,
  header:true,
  delimiter:";",
  skipEmptyLines:true,
  complete:(res)=>{
    items=res.data.map(r=>({
      sifra:r.sifra,
      naziv:r.naziv,
      vpc:r.vpc,
      mpc:r.mpc,
      pakovanje:r.pakovanje,
      grupa:r.grupa,
      redoslijed:r.redoslijed,
      slika:r.slika,
      oznaka:r.oznaka,
      akcija_postotak:r.akcija_postotak,
      aktivno:r.aktivno
    }));
    fillGroups();
    render();
  }
});
