Generative Records — GitHub Pages build

What changed in this reviewed build:
- Layout rebuilt to match the supplied reference more closely
- Full-screen panels
- Mobile nav + responsive layout
- Popup Spotify player modal instead of embedded players on page
- Blogger posts use JSONP so they can load on GitHub Pages without a backend
- Blogger posts open in an in-site modal reader, similar to the LULS modal pattern

Important:
1. Replace the placeholder Spotify embed URLs in index.html / app.js with your real album or track embed URLs.
2. Replace artwork in assets/ if you want custom covers or artist images.
3. Blogger feed is set to:
   https://freeaudiosounds.blogspot.com/feeds/posts/default?alt=json-in-script&max-results=9&callback=renderGenerativeRecordsPosts

Deploy:
- Upload contents to a GitHub repository
- Enable GitHub Pages from the main branch
