
const artists = [
  {name:"ATRISK",tag:"Featured artist",bio:"Below Human Collapse / Do You Believe In Ghosts single.",image:"assets/atrisk.svg",spotifyProfile:"https://open.spotify.com/artist/25bE9kl0BVqNDGd81fcVnw",embedSrc:"https://open.spotify.com/embed/artist/25bE9kl0BVqNDGd81fcVnw?utm_source=generator"},
  {name:"THE PIXELATED",tag:"Featured artist",bio:"Mindscape ft Koding and other digital-forward releases.",image:"assets/the-pixelated.svg",spotifyProfile:"https://open.spotify.com/artist/5khsaq4VuBxFPtdcVGwCG2",embedSrc:"https://open.spotify.com/embed/artist/5khsaq4VuBxFPtdcVGwCG2?utm_source=generator"},
  {name:"ZTh3T3ch",tag:"Artist",bio:"Red Dawn and machine-memory signal work.",image:"assets/zth3t3ch.svg",spotifyProfile:"https://open.spotify.com/artist/5fKDHygtaXB9a6DKXXi9e0",embedSrc:"https://open.spotify.com/embed/artist/5fKDHygtaXB9a6DKXXi9e0?utm_source=generator"},
  {name:"Koding",tag:"Artist",bio:"Boss Run and high-energy visual-forward releases.",image:"assets/koding.svg",spotifyProfile:"",videoUrl:"https://www.youtube.com/shorts/GvpuQk7OyTY"}
];

const releases = [
  {artist:"Koding",title:"Boss Run",image:"assets/koding.svg",externalUrl:"https://www.youtube.com/shorts/GvpuQk7OyTY",actionLabel:"Watch"},
  {artist:"ATRISK",title:"Do You Believe In Ghosts (Single)",image:"assets/atrisk.svg",externalUrl:"https://open.spotify.com/album/7Axiyo4gpClaJdQQJCRwB2?si=KMpSu3xuR_-OfMGoPMke9Q",actionLabel:"Song Link",playerTitle:"ATRISK",playerSrc:"https://open.spotify.com/embed/artist/25bE9kl0BVqNDGd81fcVnw?utm_source=generator"},
  {artist:"ZTh3T3ch",title:"Red Dawn",image:"assets/zth3t3ch.svg",externalUrl:"https://open.spotify.com/track/3vkyp3hFRarSVRfAWiLbme?si=9dd59e4739f14a70",actionLabel:"Open Track",playerTitle:"ZTh3T3ch",playerSrc:"https://open.spotify.com/embed/artist/5fKDHygtaXB9a6DKXXi9e0?utm_source=generator"},
  {artist:"THE PIXELATED",title:"Mindscape ft Koding",image:"assets/the-pixelated.svg",externalUrl:"https://open.spotify.com/track/4rFOL6X9Qu2lOuqKz5hfWw?si=22058b0b8f394ce0",actionLabel:"Open Track",playerTitle:"The Pixelated",playerSrc:"https://open.spotify.com/embed/artist/5khsaq4VuBxFPtdcVGwCG2?utm_source=generator"}
];

const FEED_URL = "https://freeaudiosounds.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=9&callback=renderGenerativeRecordsPosts";
const postsById = new Map();
let activePostId = null;

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
}
function stripHtml(v) {
  const d = document.createElement("div");
  d.innerHTML = v || "";
  return (d.textContent || d.innerText || "").replace(/\s+/g, " ").trim();
}
function escapeHtml(v) {
  return String(v || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
function toHttps(u) {
  if (!u) return "";
  return u.startsWith("http://") ? u.replace("http://", "https://") : u;
}
function upgradeBloggerImage(u, size = 1600) {
  u = toHttps(u || "");
  if (!u) return "";
  u = u.replace(/\/s\d+(-c)?\//g, `/s${size}/`);
  u = u.replace(/=s\d+(-c)?/g, `=s${size}`);
  u = u.replace(/=w\d+-h\d+(-c)?/g, `=s${size}`);
  return u;
}
function firstImageFromHtml(h) {
  const m = /<img[^>]+src=["']([^"']+)["']/i.exec(h || "");
  return m ? upgradeBloggerImage(m[1], 1600) : "";
}
function formatDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(undefined, {year:"numeric",month:"short",day:"numeric"}); }
  catch { return ""; }
}
function normalizePostId(entry) {
  const raw = entry?.id?.$t || "";
  const m = /post-(\d+)/.exec(raw);
  return m ? m[1] : raw;
}
function openExternal(url) { window.open(url, "_blank", "noopener"); }

function buildArtistGrid() {
  const grid = document.getElementById("artistGrid");
  grid.innerHTML = "";
  artists.forEach(artist => {
    const hasProfile = Boolean(artist.spotifyProfile);
    const card = el("article","artist-card",
      `<img class="artist-card__img" src="${artist.image}" alt="${escapeHtml(artist.name)}" />
       <div class="artist-card__body">
         <div class="artist-card__tag">${escapeHtml(artist.tag)}</div>
         <h3 class="artist-card__name">${hasProfile ? `<a href="${artist.spotifyProfile}" target="_blank" rel="noopener">${escapeHtml(artist.name)}</a>` : escapeHtml(artist.name)}</h3>
         <p class="artist-card__bio">${escapeHtml(artist.bio)}</p>
         <div class="artist-card__links"></div>
       </div>`);
    const links = card.querySelector(".artist-card__links");
    if (artist.embedSrc) {
      const listen = el("button","artist-chip","Listen");
      listen.type = "button";
      listen.addEventListener("click", e => { e.stopPropagation(); openPlayer(artist.name, artist.embedSrc); });
      links.appendChild(listen);
    }
    if (hasProfile) {
      const profile = el("a","artist-chip","Spotify Profile");
      profile.href = artist.spotifyProfile;
      profile.target = "_blank";
      profile.rel = "noopener";
      links.appendChild(profile);
      card.style.cursor = "pointer";
      card.addEventListener("click", e => {
        if (e.target.closest(".artist-chip") || e.target.closest("a")) return;
        openExternal(artist.spotifyProfile);
      });
    } else if (artist.videoUrl) {
      const watch = el("a","artist-chip","Watch");
      watch.href = artist.videoUrl;
      watch.target = "_blank";
      watch.rel = "noopener";
      links.appendChild(watch);
    }
    grid.appendChild(card);
  });
}

function buildReleaseThumbs() {
  const grid = document.getElementById("homeReleaseGrid");
  grid.innerHTML = "";
  releases.forEach(r => {
    const item = el("div","release-thumb",
      `<img class="release-thumb__img" src="${r.image}" alt="${escapeHtml(r.artist)} ${escapeHtml(r.title)}" />
       <p class="release-thumb__artist">${escapeHtml(r.artist.toLowerCase())}</p>
       <p class="release-thumb__title">${escapeHtml(r.title)}</p>`);
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      if (r.playerSrc) openPlayer(r.playerTitle, r.playerSrc);
      else if (r.externalUrl) openExternal(r.externalUrl);
    });
    grid.appendChild(item);
  });
}

function buildReleaseShowcase() {
  const wrap = document.getElementById("releaseShowcase");
  wrap.innerHTML = "";
  releases.forEach(r => {
    const primary = r.playerSrc
      ? `<button class="inline-link" data-player-title="${escapeHtml(r.playerTitle)}" data-player-src="${escapeHtml(r.playerSrc)}">Listen</button>`
      : `<a class="inline-link" href="${r.externalUrl}" target="_blank" rel="noopener">${escapeHtml(r.actionLabel || "Open")}</a>`;
    const secondary = r.externalUrl
      ? `<a class="inline-link" href="${r.externalUrl}" target="_blank" rel="noopener">${escapeHtml(r.actionLabel || "Open")}</a>`
      : "";
    wrap.appendChild(el("article","release-card",
      `<img class="release-card__img" src="${r.image}" alt="${escapeHtml(r.artist)} ${escapeHtml(r.title)}" />
       <div class="release-card__body">
         <h3 class="release-card__artist">${escapeHtml(r.artist)}</h3>
         <p class="release-card__title">${escapeHtml(r.title)}</p>
         <div class="release-card__actions">${primary}${secondary}</div>
       </div>`));
  });
}

function openPlayer(title, src) {
  const modal = document.getElementById("playerModal");
  document.getElementById("playerTitle").textContent = title || "Spotify Player";
  document.getElementById("playerFrame").src = src || "";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}
function closePlayer() {
  const modal = document.getElementById("playerModal");
  document.getElementById("playerFrame").src = "";
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}
function openPost(postId, pushUrl = true) {
  const post = postsById.get(String(postId));
  if (!post) return;
  activePostId = String(postId);
  document.getElementById("postBody").innerHTML =
    `<div class="post-reader__meta">${escapeHtml(post.dateText)}</div>
     <h2 class="post-reader__title">${escapeHtml(post.title)}</h2>
     ${post.heroImage ? `<img class="post-reader__img" src="${post.heroImage}" alt="${escapeHtml(post.title)}">` : ""}
     <div class="post-reader__content">${post.contentHtml}</div>`;
  if (pushUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("post", activePostId);
    history.pushState({post:activePostId}, "", url.toString());
  }
  const modal = document.getElementById("postModal");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}
function closePost(updateUrl = true) {
  const modal = document.getElementById("postModal");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  activePostId = null;
  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    history.pushState({post:null}, "", url.toString());
  }
}
async function copyCurrentPostLink() {
  const url = window.location.href;
  try { await navigator.clipboard.writeText(url); }
  catch {
    const ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}
async function shareCurrentPost() {
  if (!activePostId) return;
  const post = postsById.get(activePostId);
  if (!post) return;
  const shareData = {title:post.title, text:post.title, url:window.location.href};
  try {
    if (navigator.share) await navigator.share(shareData);
    else await copyCurrentPostLink();
  } catch {}
}
function buildPosts(entries) {
  const grid = document.getElementById("postsGrid");
  const status = document.getElementById("feedStatus");
  grid.innerHTML = "";
  postsById.clear();
  entries.forEach(entry => {
    const id = normalizePostId(entry);
    const title = entry?.title?.$t || "Untitled";
    const contentHtml = entry?.content?.$t || entry?.summary?.$t || "";
    const text = stripHtml(contentHtml);
    const excerpt = text.length > 180 ? `${text.slice(0,177)}…` : text;
    const heroImage = firstImageFromHtml(contentHtml);
    const dateText = formatDate(entry?.published?.$t);
    postsById.set(String(id), {id,title,contentHtml,excerpt,heroImage,dateText});
    const card = el("article","post-card",
      `${heroImage ? `<img class="post-card__img" src="${heroImage}" alt="${escapeHtml(title)}" loading="lazy">` : `<div class="post-card__img"></div>`}
       <div class="post-card__body">
         <div class="post-card__meta">${escapeHtml(dateText)}</div>
         <h3 class="post-card__title">${escapeHtml(title)}</h3>
         <p class="post-card__excerpt">${escapeHtml(excerpt)}</p>
         <div class="post-card__actions"><button class="post-link" type="button">Read Post</button></div>
       </div>`);
    card.querySelector(".post-link").addEventListener("click", () => openPost(id, true));
    grid.appendChild(card);
  });
  status.textContent = entries.length ? `Loaded ${entries.length} latest posts from Blogger.` : "No posts found.";
}
window.renderGenerativeRecordsPosts = function(data) {
  const entries = data?.feed?.entry || [];
  buildPosts(entries);
  const desired = new URL(window.location.href).searchParams.get("post");
  if (desired && postsById.has(desired)) openPost(desired, false);
};
function loadBloggerFeed() {
  const old = document.getElementById("bloggerFeedScript");
  if (old) old.remove();
  const script = document.createElement("script");
  script.id = "bloggerFeedScript";
  script.src = FEED_URL;
  script.async = true;
  script.onerror = () => {
    document.getElementById("feedStatus").textContent = "Could not load Blogger posts. Check the feed URL or browser network settings.";
  };
  document.body.appendChild(script);
}
function initMenu() {
  const button = document.getElementById("menuButton");
  const nav = document.getElementById("siteNav");
  button.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    button.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  }));
}
function initNavHighlight() {
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links.map(link => {
    const target = document.querySelector(link.getAttribute("href"));
    return target ? {link, target} : null;
  }).filter(Boolean);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.remove("active"));
      const hit = sections.find(item => item.target === entry.target);
      if (hit) hit.link.classList.add("active");
    });
  }, {rootMargin:"-35% 0px -45% 0px", threshold:.01});
  sections.forEach(item => observer.observe(item.target));
}
function initModalControls() {
  document.addEventListener("click", e => {
    if (e.target.matches("[data-close-player='1']")) closePlayer();
    if (e.target.matches("[data-close-post='1']")) closePost(true);
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closePlayer();
      closePost(true);
    }
  });
  window.addEventListener("popstate", () => {
    const postId = new URL(window.location.href).searchParams.get("post");
    if (postId && postsById.has(postId)) openPost(postId, false);
    else closePost(false);
  });
}
function wireStaticPlayerButtons() {
  document.querySelectorAll("[data-player-src]").forEach(button => {
    button.addEventListener("click", () => openPlayer(button.getAttribute("data-player-title"), button.getAttribute("data-player-src")));
  });
}
document.addEventListener("DOMContentLoaded", () => {
  buildArtistGrid();
  buildReleaseThumbs();
  buildReleaseShowcase();
  wireStaticPlayerButtons();
  initMenu();
  initNavHighlight();
  initModalControls();
  loadBloggerFeed();
  document.getElementById("sharePost").addEventListener("click", shareCurrentPost);
  document.getElementById("copyPost").addEventListener("click", copyCurrentPostLink);
});
