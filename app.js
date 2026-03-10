
const artists = [
  {
    name: "ATRISK",
    tag: "Featured artist",
    bio: "Glitched silhouettes, algorithmic pressure, recursive machine noise, and late-night signal collapse.",
    image: "assets/thumb-1.jpg",
    links: [
      { label: "Listen", type: "player", title: "ATRISK — Recursion", src: "https://open.spotify.com/embed/album/4GzM8r8M8ExampleA?utm_source=generator" },
      { label: "Release Posts", type: "anchor", href: "#news" }
    ]
  },
  {
    name: "THE PIXELS",
    tag: "Featured artist",
    bio: "Machine pop, luminous structures, synthetic hooks, and digital bodies emerging from signal.",
    image: "assets/thumb-5.jpg",
    links: [
      { label: "Stream", type: "player", title: "The Pixels — Synthesis", src: "https://open.spotify.com/embed/album/3PxL8s9R9ExampleB?utm_source=generator" },
      { label: "Release Posts", type: "anchor", href: "#news" }
    ]
  },
  {
    name: "Koding",
    tag: "Artist",
    bio: "Code-bent textures, synthetic rhythm design, and harsh soft-focus electronics.",
    image: "assets/koding.jpg",
    links: [
      { label: "Posts", type: "anchor", href: "#news" }
    ]
  },
  {
    name: "ZTh3T3ch",
    tag: "Artist",
    bio: "Corrupted process music, neon drift, and broken machine memory set to pulse.",
    image: "assets/zth3t3ch.jpg",
    links: [
      { label: "Posts", type: "anchor", href: "#news" }
    ]
  },
  {
    name: "Zilla",
    tag: "Artist",
    bio: "Darkwave circuitry, blown-out digital pressure, and collapse-ready beat architecture.",
    image: "assets/zilla.jpg",
    links: [
      { label: "Posts", type: "anchor", href: "#news" }
    ]
  }
];

const releases = [
  { artist: "atrisk", title: "recursion", image: "assets/thumb-1.jpg", hero: true, playerTitle: "ATRISK — Recursion", playerSrc: "https://open.spotify.com/embed/album/4GzM8r8M8ExampleA?utm_source=generator" },
  { artist: "atrisk", title: "generative form", image: "assets/thumb-2.jpg" },
  { artist: "the pixels", title: "algorithmic bloom", image: "assets/thumb-3.jpg" },
  { artist: "the pixels", title: "signal synthesis", image: "assets/thumb-4.jpg", hero: true, playerTitle: "The Pixels — Synthesis", playerSrc: "https://open.spotify.com/embed/album/3PxL8s9R9ExampleB?utm_source=generator" },
  { artist: "the pixels", title: "electric bodies", image: "assets/thumb-5.jpg" },
  { artist: "the pixels", title: "resonant mesh", image: "assets/thumb-6.jpg" }
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

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function firstImageFromHtml(html) {
  const match = /<img[^>]+src=["']([^"']+)["']/i.exec(html || "");
  return match ? upgradeBloggerImage(match[1], 1200) : "";
}

function toHttps(url) {
  if (!url) return "";
  return url.startsWith("http://") ? url.replace("http://", "https://") : url;
}

function upgradeBloggerImage(url, size = 1200) {
  url = toHttps(url || "");
  if (!url) return "";
  url = url.replace(/\/s\d+(-c)?\//g, `/s${size}/`);
  url = url.replace(/=s\d+(-c)?/g, `=s${size}`);
  url = url.replace(/=w\d+-h\d+(-c)?/g, `=s${size}`);
  return url;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch (e) {
    return "";
  }
}

function normalizePostId(entry) {
  const raw = entry?.id?.$t || "";
  const match = /post-(\d+)/.exec(raw);
  return match ? match[1] : raw;
}

function getPostLink(entry) {
  const links = entry?.link || [];
  const alt = links.find(l => l.rel === "alternate");
  return alt ? alt.href : "#";
}

function buildArtistGrid() {
  const grid = document.getElementById("artistGrid");
  grid.innerHTML = "";
  artists.forEach(artist => {
    const card = el("article", "artist-card");
    card.innerHTML = `
      <img class="artist-card__img" src="${artist.image}" alt="${escapeHtml(artist.name)}" />
      <div class="artist-card__body">
        <div class="artist-card__tag">${escapeHtml(artist.tag)}</div>
        <h3 class="artist-card__name">${escapeHtml(artist.name)}</h3>
        <p class="artist-card__bio">${escapeHtml(artist.bio)}</p>
        <div class="artist-card__links"></div>
      </div>
    `;
    const linksWrap = card.querySelector(".artist-card__links");
    artist.links.forEach(link => {
      if (link.type === "player") {
        const btn = el("button", "artist-chip", escapeHtml(link.label));
        btn.type = "button";
        btn.addEventListener("click", () => openPlayer(link.title, link.src));
        linksWrap.appendChild(btn);
      } else {
        const a = el("a", "artist-chip", escapeHtml(link.label));
        a.href = link.href;
        linksWrap.appendChild(a);
      }
    });
    grid.appendChild(card);
  });
}

function buildReleaseThumbs() {
  const grid = document.getElementById("homeReleaseGrid");
  grid.innerHTML = "";
  releases.forEach(release => {
    const item = el("div", "release-thumb");
    const canPlay = Boolean(release.playerSrc);
    item.innerHTML = `
      <img class="release-thumb__img" src="${release.image}" alt="${escapeHtml(release.artist)} ${escapeHtml(release.title)}" />
      <p class="release-thumb__artist">${escapeHtml(release.artist)}</p>
      <p class="release-thumb__title">${escapeHtml(release.artist)} - ${escapeHtml(release.title)}</p>
    `;
    if (canPlay) {
      item.style.cursor = "pointer";
      item.addEventListener("click", () => openPlayer(release.playerTitle, release.playerSrc));
    }
    grid.appendChild(item);
  });
}

function buildReleaseShowcase() {
  const wrap = document.getElementById("releaseShowcase");
  wrap.innerHTML = "";
  releases.slice(0, 3).forEach(release => {
    const card = el("article", "release-card");
    const actions = release.playerSrc
      ? `<button class="inline-link" data-player-title="${escapeHtml(release.playerTitle)}" data-player-src="${escapeHtml(release.playerSrc)}">Listen</button>`
      : `<a class="inline-link" href="#news">Related Posts</a>`;
    card.innerHTML = `
      <img class="release-card__img" src="${release.image}" alt="${escapeHtml(release.artist)} ${escapeHtml(release.title)}" />
      <div class="release-card__body">
        <h3 class="release-card__artist">${escapeHtml(release.artist)}</h3>
        <p class="release-card__title">${escapeHtml(release.title)}</p>
        <div class="release-card__actions">${actions}<a class="inline-link" href="#artists">Artist Profile</a></div>
      </div>
    `;
    wrap.appendChild(card);
  });
}

function wireStaticPlayerButtons() {
  document.querySelectorAll("[data-player-src]").forEach(btn => {
    btn.addEventListener("click", () => openPlayer(btn.getAttribute("data-player-title") || "Spotify Player", btn.getAttribute("data-player-src")));
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

  const body = document.getElementById("postBody");
  body.innerHTML = `
    <div class="post-reader__meta">${escapeHtml(post.dateText)}</div>
    <h2 class="post-reader__title">${escapeHtml(post.title)}</h2>
    ${post.heroImage ? `<img class="post-reader__img" src="${post.heroImage}" alt="">` : ""}
    <div class="post-reader__content">${post.contentHtml}</div>
  `;

  if (pushUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("post", activePostId);
    history.pushState({ post: activePostId }, "", url.toString());
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
    history.pushState({ post: null }, "", url.toString());
  }
}

async function shareCurrentPost() {
  if (!activePostId) return;
  const post = postsById.get(activePostId);
  if (!post) return;
  const url = window.location.href;
  const shareData = { title: post.title, text: post.title, url };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await copyCurrentPostLink();
    }
  } catch (e) {}
}

async function copyCurrentPostLink() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
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
    const excerpt = text.length > 180 ? `${text.slice(0, 177)}…` : text;
    const heroImage = firstImageFromHtml(contentHtml);
    const dateText = formatDate(entry?.published?.$t);
    const link = getPostLink(entry);

    postsById.set(String(id), { id, title, contentHtml, excerpt, heroImage, dateText, link });

    const card = el("article", "post-card");
    card.innerHTML = `
      ${heroImage ? `<img class="post-card__img" src="${heroImage}" alt="${escapeHtml(title)}" loading="lazy">` : `<div class="post-card__img"></div>`}
      <div class="post-card__body">
        <div class="post-card__meta">${escapeHtml(dateText)}</div>
        <h3 class="post-card__title">${escapeHtml(title)}</h3>
        <p class="post-card__excerpt">${escapeHtml(excerpt)}</p>
        <div class="post-card__actions">
          <button class="post-link" type="button">Read Post</button>
          <a class="post-ext" href="${link}" target="_blank" rel="noopener">Open Source</a>
        </div>
      </div>
    `;
    card.querySelector(".post-link").addEventListener("click", () => openPost(id, true));
    grid.appendChild(card);
  });

  status.textContent = entries.length ? `Loaded ${entries.length} latest posts from Blogger.` : "No posts found.";
}

window.renderGenerativeRecordsPosts = function(data) {
  const entries = data?.feed?.entry || [];
  buildPosts(entries);
  const desiredPostId = new URL(window.location.href).searchParams.get("post");
  if (desiredPostId && postsById.has(desiredPostId)) {
    openPost(desiredPostId, false);
  }
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
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function initModalClose() {
  document.addEventListener("click", event => {
    if (event.target.matches("[data-close-player='1']")) closePlayer();
    if (event.target.matches("[data-close-post='1']")) closePost(true);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closePlayer();
      closePost(true);
    }
  });
  window.addEventListener("popstate", () => {
    const postId = new URL(window.location.href).searchParams.get("post");
    if (postId && postsById.has(postId)) {
      openPost(postId, false);
    } else {
      closePost(false);
    }
  });
}

function setActiveNav() {
  const links = [...document.querySelectorAll(".site-nav a")];
  const sections = links
    .map(link => {
      const id = link.getAttribute("href");
      return document.querySelector(id) ? { link, section: document.querySelector(id) } : null;
    })
    .filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const hit = sections.find(s => s.section === entry.target);
        links.forEach(l => l.classList.remove("active"));
        if (hit) hit.link.classList.add("active");
      }
    });
  }, { rootMargin: "-35% 0px -45% 0px", threshold: 0.01 });

  sections.forEach(s => observer.observe(s.section));
}

document.addEventListener("DOMContentLoaded", () => {
  buildArtistGrid();
  buildReleaseThumbs();
  buildReleaseShowcase();
  wireStaticPlayerButtons();
  initMenu();
  initModalClose();
  setActiveNav();
  loadBloggerFeed();

  document.getElementById("sharePost").addEventListener("click", shareCurrentPost);
  document.getElementById("copyPost").addEventListener("click", copyCurrentPostLink);
});
