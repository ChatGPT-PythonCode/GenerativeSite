const releases=[{artist:"atrisk",title:"recursion"},{artist:"the pixels",title:"synthesis"}];
const artists=[{name:"ATRISK",bio:"Algorithmic chaos and digital noise."},{name:"THE PIXELS",bio:"Synthetic melodies and machine pop."}];
const posts=[{title:"ATRISK — Recursion",excerpt:"New generative systems release."},{title:"The Pixels — Synthesis",excerpt:"Exploring structured randomness."}];

function renderGrid(data,id){
const el=document.getElementById(id);
data.forEach(d=>{
const div=document.createElement("div");
div.className="card";
div.innerHTML=`<h3>${d.artist||d.name||d.title}</h3><p>${d.title||d.bio||d.excerpt}</p>`;
el.appendChild(div);
});
}

renderGrid(releases,"releaseGrid");
renderGrid(artists,"artistGrid");
renderGrid(posts,"postsGrid");