/*
 * Fixes Excel export inside the Android app.
 *
 * In a real browser, XLSX.writeFile() triggers a normal file download.
 * Inside an embedded WebView (the Android app) there's no download
 * manager to catch that, so it silently does nothing even though the
 * app's own success message still shows.
 *
 * This patches XLSX.writeFile to, ONLY when running inside the native
 * app, save the file via Capacitor's Filesystem plugin and then open
 * Android's native "Save/Share" sheet so the user can save it wherever
 * they want. On the regular website this file does nothing at all —
 * it only activates inside the native app, so it's safe to load
 * everywhere.
 */
(function () {
  function isNativeApp() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }

  if (!isNativeApp()) return;

  function patch() {
    if (typeof XLSX === 'undefined' || !XLSX.writeFile || XLSX.writeFile.__stockifyPatched) return;

    const originalWriteFile = XLSX.writeFile.bind(XLSX);

    const patched = function (workbook, filename, opts) {
      try {
        const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
        const plugins = window.Capacitor && window.Capacitor.Plugins;
        const Filesystem = plugins && plugins.Filesystem;
        const Share = plugins && plugins.Share;

        if (!Filesystem) {
          console.warn('Filesystem plugin unavailable, falling back to browser download.');
          return originalWriteFile(workbook, filename, opts);
        }

        Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: 'DOCUMENTS',
          recursive: true,
        }).then((result) => {
          if (Share && result && result.uri) {
            Share.share({
              title: filename,
              url: result.uri,
              dialogTitle: 'Save or share ' + filename,
            }).catch(() => {
              // Share sheet dismissed or unavailable — file is still saved.
            });
          }
        }).catch((err) => {
          console.error('Native Excel save failed, falling back to browser download:', err);
          originalWriteFile(workbook, filename, opts);
        });
      } catch (err) {
        console.error('Excel export shim error, falling back to browser download:', err);
        originalWriteFile(workbook, filename, opts);
      }
    };

    patched.__stockifyPatched = true;
    XLSX.writeFile = patched;
  }

  // XLSX loads from a CDN script tag; poll briefly until it's ready
  // rather than assuming load order.
  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (typeof XLSX !== 'undefined') {
      patch();
      clearInterval(timer);
    } else if (attempts > 50) {
      clearInterval(timer);
    }
  }, 100);
})();

/*
 * Fixes the camera/flashlight staying on (and the app slowing down)
 * after closing the barcode scanner.
 *
 * script.js's stopCamera() correctly stops the media tracks, but never
 * detaches them from the <video> element (video.srcObject stays set).
 * On Android's WebView, that can leave the camera hardware session
 * running in the background even though the tracks are "stopped",
 * which is what keeps the camera indicator + flashlight active and
 * drags down performance. This patches stopCamera to also clear the
 * video element afterward. Harmless on the regular website too.
 */
(function () {
  function patchStopCamera() {
    if (typeof window.stopCamera !== 'function' || window.stopCamera.__stockifyPatched) return;

    const originalStopCamera = window.stopCamera;

    const patched = function () {
      originalStopCamera();
      try {
        const video = document.getElementById('scanner-video');
        if (video) {
          video.pause();
          video.srcObject = null;
        }
      } catch (e) {
        console.error('Camera cleanup fix error:', e);
      }
    };

    patched.__stockifyPatched = true;
    window.stopCamera = patched;
  }

  patchStopCamera();

  // script.js may load after this file, so retry briefly.
  let camAttempts = 0;
  const camTimer = setInterval(() => {
    camAttempts += 1;
    if (typeof window.stopCamera === 'function') {
      patchStopCamera();
      clearInterval(camTimer);
    } else if (camAttempts > 50) {
      clearInterval(camTimer);
    }
  }, 100);
})();

/*
 * Fixes typing lag in search/filter boxes (Inventory search, stock
 * range, price range, etc).
 *
 * script.js's search fields each call debounce(...) fresh on every
 * single keystroke instead of reusing one debounced function. Since
 * every call creates a brand new independent timer, none of them
 * cancel each other — type 5 characters quickly and you schedule 5
 * separate full inventory searches that all still fire, one after
 * another, instead of just the one you actually wanted. That pileup
 * of redundant searches is what shows up as lag while typing.
 *
 * This patches the global debounce() so all calls to it share a
 * single timer, restoring normal debounce behavior (each new
 * keystroke cancels the previous pending search) without touching
 * any of the search box code itself.
 */
(function () {
  function patchDebounce() {
    if (typeof window.debounce !== 'function' || window.debounce.__stockifyPatched) return;

    let sharedTimeoutId = null;

    const patched = function (func, delay) {
      return function (...args) {
        const context = this;
        clearTimeout(sharedTimeoutId);
        sharedTimeoutId = setTimeout(() => func.apply(context, args), delay);
      };
    };

    patched.__stockifyPatched = true;
    window.debounce = patched;
  }

  patchDebounce();

  // script.js may load after this file, so retry briefly.
  let debAttempts = 0;
  const debTimer = setInterval(() => {
    debAttempts += 1;
    if (typeof window.debounce === 'function') {
      patchDebounce();
      clearInterval(debTimer);
    } else if (debAttempts > 50) {
      clearInterval(debTimer);
    }
  }, 100);
})();
