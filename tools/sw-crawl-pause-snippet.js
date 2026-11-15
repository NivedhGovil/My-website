/* ---------------------------------------------------------------------
   This file does not belong to this site. It is a snippet for the OTHER
   repository -- github.com/NivedhGovil/SW-Crawl -- and nothing here
   loads it.

   WHY IT EXISTS
   The Software page runs SW-Crawl in a frame, and has a button beside
   it. Because SW-Crawl is served from its own origin, this site cannot
   reach into the frame to stop the animation: contentDocument comes
   back null and reading styleSheets throws a SecurityError. The one
   channel left open is postMessage, and that only works if the page
   inside the frame is listening.

   So today the button says "Stop the crawl" and unloads the frame,
   which is honest about what it does. Paste the code below at the end
   of SW-Crawl's index.html, inside a <script> tag, and deploy it: the
   button on the portfolio notices the answer and relabels itself to
   "Pause the crawl" on its own. Nothing on this site needs changing.

   The listener only answers messages that name the app, replies to the
   origin that asked, and does nothing but start and stop an animation,
   so there is nothing here for a stranger to abuse.
   ------------------------------------------------------------------ */

addEventListener('message', function (event) {
  var data = event.data;
  if (!data || data.app !== 'sw-crawl') return;

  var crawl = document.querySelector('.crawl');
  if (!crawl) return;

  if (data.action === 'ping') {
    /* "Yes, I am listening." This is what turns Stop into Pause. */
    event.source.postMessage({ app: 'sw-crawl', action: 'pong' }, event.origin);
    return;
  }

  if (data.action === 'pause') crawl.style.animationPlayState = 'paused';
  if (data.action === 'play') crawl.style.animationPlayState = 'running';

  event.source.postMessage({
    app: 'sw-crawl',
    action: 'state',
    paused: crawl.style.animationPlayState === 'paused'
  }, event.origin);
});
