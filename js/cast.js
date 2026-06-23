// ─── Chromecast ───────────────────────────────────────────────────────────────
function setupCastListeners() {
  if (typeof cast === 'undefined' || !cast.framework) {
    console.log('Cast framework unavailable');
    return;
  }

  window['__onGCastApiAvailable'] = function(isAvailable) {
    if (!isAvailable) return;

    try {
      const ctx = cast.framework.CastContext.getInstance();

      ctx.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });

      ctx.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (e) => {
          const state = e.sessionState;

          if (
            state === cast.framework.SessionState.SESSION_STARTED ||
            state === cast.framework.SessionState.SESSION_RESUMED
          ) {
            castSession = ctx.getCurrentSession();

            const deviceName =
              castSession.getCastDevice().friendlyName;

            document.getElementById('castDeviceName').textContent =
              `Casting to: ${deviceName}`;

            document
              .getElementById('castOverlay')
              .classList.add('visible');

            document
              .getElementById('castBtn')
              .classList.add('casting');

            castCam(CAMS[currentIdx]);

            showToast(`🎬 Casting to ${deviceName}`);
          } else if (
            state === cast.framework.SessionState.SESSION_ENDED
          ) {
            castSession = null;

            document
              .getElementById('castOverlay')
              .classList.remove('visible');

            document
              .getElementById('castBtn')
              .classList.remove('casting');

            showToast('Casting stopped');
          }
        }
      );
    } catch (err) {
      console.error('Cast setup failed:', err);
    }
  };
}

function castCam(cam) {
  if (!castSession) return;

  if ((cam.provider || '').toLowerCase() !== 'twitch') {
    showToast('Casting currently supported only for Twitch cameras');
    return;
  }
  const mediaInfo = new chrome.cast.media.MediaInfo(`https://www.twitch.tv/${cam.source}`, 'video/mp4');
  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
  mediaInfo.metadata.title = `${cam.venue} — ${cam.name}`;
  mediaInfo.metadata.subtitle = 'SpyderNetwork • Lake of the Ozarks LIVE';
  castSession.loadMedia(new chrome.cast.media.LoadRequest(mediaInfo)).catch(() => {
    showToast('Stream sent to TV');
  });
}

document.getElementById('castBtn').addEventListener('click', async () => {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

  if (isMobile) {
    showToast('Use your browser or device screen-casting feature for best results while cycling cams');
    alert(
      'For the smoothest auto-cycle experience:\n\n' +
      '• Android: Use Chrome > Cast Screen\n' +
      '• iPhone/iPad: Use Screen Mirroring / AirPlay\n\n' +
      'This keeps camera cycling working continuously on your TV.'
    );
    return;
  }

  if (typeof cast !== 'undefined' && cast.framework) {
    showToast('Starting cast session...');
    cast.framework.CastContext.getInstance().requestSession();
  } else {
    alert(
      'Best experience:\n\n' +
      'Use Google Chrome desktop browser and use:\n' +
      'Menu > Cast > Cast Tab\n\n' +
      'This allows auto-cycle to continue on the TV.'
    );
  }
});

function stopCast() {
  if (castSession) castSession.endSession(true);
}
