const artists=[
{name:"ATRISK"},
{name:"THE PIXELS"},
{name:"Koding"},
{name:"ZTh3T3ch"},
{name:"Zilla"}
];

const releases=[
{title:"Recursion"},
{title:"Synthesis"}
];

function render(list,id,key){
const el=document.getElementById(id);
list.forEach(i=>{
const d=document.createElement("div");
d.className="card";
d.innerHTML=`<h3>${i[key]||i.title}</h3>`;
el.appendChild(d);
});
}

render(artists,"artistGrid","name");
render(releases,"releaseGrid","title");

fetch("https://freeaudiosounds.blogspot.com/feeds/posts/default?alt=json")
.then(r=>r.json())
.then(data=>{
const posts=data.feed.entry.slice(0,6);
const grid=document.getElementById("postsGrid");
posts.forEach(p=>{
const title=p.title.$t;
const link=p.link.find(l=>l.rel==="alternate").href;
const div=document.createElement("div");
div.className="card";
div.innerHTML=`<h3>${title}</h3><a href="${link}" target="_blank">Read</a>`;
grid.appendChild(div);
});
});

function openPlayer(url){
document.getElementById("playerModal").style.display="flex";
document.getElementById("spotifyFrame").src=url;
}
function closePlayer(){
document.getElementById("playerModal").style.display="none";
document.getElementById("spotifyFrame").src="";
}
