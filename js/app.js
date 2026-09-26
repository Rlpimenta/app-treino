const URL_BANCO="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const BASE_IMAGENS="https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
const URL_MUSCLEWIKI="https://musclewiki.com/pt-br";
const CATEGORIAS={
 Lats:"lats",Chest:"chest",Quads:"quads",Hamstrings:"hamstrings",Glutes:"glutes",
 Calves:"calves",Shoulders:"shoulders",Biceps:"biceps",Triceps:"triceps",
 Forearms:"forearms",Abs:"abs","Upper Back":"upper-back"
};
const CHAVE="meuTreinoPesosV3";
let banco=[];

document.addEventListener("DOMContentLoaded",async()=>{
 prepararNomes();
 prepararPesos();
 await carregarBanco();
});

function prepararNomes(){
 document.querySelectorAll(".card-exercicio").forEach(card=>{
  const nome=card.dataset.exercicio, grupo=card.dataset.musculo;
  const categoria=CATEGORIAS[grupo]||"";
  const url=categoria?`${URL_MUSCLEWIKI}/exercises/${categoria}`:URL_MUSCLEWIKI;
  card.querySelector(".nome-exercicio").innerHTML=
   `${card.dataset.falha==="true"?'<span class="falha">🔥</span>':""}<a href="${url}" target="_blank" rel="noopener" title="Abrir exercícios de ${grupo}">${nome} ↗</a>`;
 });
}

function lerPesos(){
 try{return JSON.parse(localStorage.getItem(CHAVE))||{}}catch{return {}}
}
function prepararPesos(){
 const pesos=lerPesos();
 document.querySelectorAll(".card-exercicio").forEach(card=>{
  const nome=card.dataset.exercicio,input=card.querySelector(".peso-input"),botao=card.querySelector(".guardar-peso");
  if(pesos[nome]!==undefined){input.value=pesos[nome];botao.classList.add("guardado")}
  const guardar=()=>guardarPeso(nome,input,botao);
  botao.addEventListener("click",guardar);
  input.addEventListener("keydown",e=>{if(e.key==="Enter")guardar()});
 });
}
function guardarPeso(nome,input,botao){
 const pesos=lerPesos(),valor=input.value.trim();
 if(valor==="") delete pesos[nome]; else pesos[nome]=valor;
 localStorage.setItem(CHAVE,JSON.stringify(pesos));
 botao.classList.add("guardado");
}

async function carregarBanco(){
 try{
  const resposta=await fetch(URL_BANCO);
  if(!resposta.ok) throw new Error("Banco indisponível");
  banco=await resposta.json();
  prepararImagens();
 }catch(erro){
  console.error(erro);
  document.querySelectorAll(".imagem-carregando").forEach(x=>x.textContent="Imagem indisponível");
 }
}

function prepararImagens(){
 document.querySelectorAll(".card-exercicio").forEach(card=>{
  const id=card.dataset.imagem;
  const item=banco.find(x=>normalizar(x.id)===normalizar(id)||normalizar(x.name)===normalizar(id.replaceAll("_"," ")));
  if(!item||!item.images?.length){card.querySelector(".imagem-carregando").textContent="Imagem indisponível";return;}
  const urls=item.images.slice(0,2).map(x=>BASE_IMAGENS+x);
  configurarImagens(card,urls,id);
 });
}

function configurarImagens(card,urls,id){
 const a=card.querySelector(".link-imagem"),i1=card.querySelector(".imagem-1"),i2=card.querySelector(".imagem-2"),msg=card.querySelector(".imagem-carregando");
 i1.src=urls[0];i1.alt=`Demonstração de ${card.dataset.exercicio}`;i1.classList.add("visivel");
 if(urls[1]){i2.src=urls[1];i2.alt=`Segunda imagem de ${card.dataset.exercicio}`; iniciarAnimacao(card,i1,i2);}
 a.href=`https://github.com/yuhonas/free-exercise-db/tree/main/exercises/${encodeURIComponent(id).replace(/%2F/g,"/")}`;
 i1.addEventListener("load",()=>msg.style.display="none");
 i1.addEventListener("error",()=>{i1.style.display="none";msg.textContent="Imagem indisponível"});
}

function iniciarAnimacao(card,i1,i2){
 let atual=0,timer;
 const trocar=()=>{atual=atual?0:1;i1.classList.toggle("visivel",atual===0);i2.classList.toggle("visivel",atual===1)};
 const iniciar=ms=>{clearInterval(timer);timer=setInterval(trocar,ms)};
 iniciar(1000);
 card.addEventListener("mouseenter",()=>iniciar(500));
 card.addEventListener("mouseleave",()=>iniciar(1000));
}

function normalizar(texto){
 return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
}
