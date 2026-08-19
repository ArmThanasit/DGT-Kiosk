/* =========================================================
   map.js
   Floor maps, pan/zoom, floor navigation, QR, clock, idle timer
   ========================================================= */

  /* ================= Configuration ================= */
  // ถ้าคุณนำเว็บขึ้นโฮสต์จริง (เช่น GitHub Pages, Vercel หรือ Web Server ของ มทส.)
  // สามารถใส่ URL เว็บจริงไว้ที่นี่ เช่น "https://kiosk.sut.ac.th" หรือ "http://192.168.1.128:5500"
  // หากปล่อยว่างไว้ "" ระบบจะใช้ URL ของเบราว์เซอร์ปัจจุบันอัตโนมัติ
  var KIOSK_ONLINE_URL = "";

  var floorImages = {
    1: "assets/floor-1.jpg",
    2: "assets/floor-2.jpg",
    3: "assets/floor-3.jpg",
    4: "assets/floor-4.jpg",
    5: "assets/floor-5.jpg"
  };

  /* ================= Pan & zoom ================= */
  var viewport = document.getElementById("mapViewport");
  var surface = document.getElementById("mapSurface");
  var scale = 1, minScale = 0.15, maxScale = 4;
  var panX = 0, panY = 0;
  var dragging = false, lastX = 0, lastY = 0;
  var pinchStartDist = null, pinchStartScale = 1;

  function applyTransform(){
    surface.style.transform = "translate(-50%,-50%) translate("+panX+"px,"+panY+"px) scale("+scale+")";
  }

  function resetView(){
    var vw = viewport.clientWidth  || 600;
    var vh = viewport.clientHeight || 400;
    var imgEl = document.getElementById("mapImage");
    var cssWidth = parseInt(getComputedStyle(imgEl).width,10) || 900;
    var renderW = cssWidth;
    var renderH = imgEl.naturalHeight
      ? (cssWidth * imgEl.naturalHeight / imgEl.naturalWidth)
      : (cssWidth * 0.65);
    scale = Math.min(vw / renderW, vh / renderH) * 0.9;
    scale = Math.max(minScale, Math.min(maxScale, scale));
    panX = 0; panY = 0;
    applyTransform();
  }

  /* Mouse events */
  viewport.addEventListener("mousedown", function(e){ dragging=true; lastX=e.clientX; lastY=e.clientY; viewport.classList.add("grabbing"); });
  window.addEventListener("mouseup", function(){ dragging=false; viewport.classList.remove("grabbing"); });
  window.addEventListener("mousemove", function(e){
    if(!dragging) return;
    panX += e.clientX-lastX; panY += e.clientY-lastY;
    lastX=e.clientX; lastY=e.clientY; applyTransform();
  });
  viewport.addEventListener("wheel", function(e){
    e.preventDefault();
    var delta = e.deltaY > 0 ? -0.12 : 0.12;
    scale = Math.min(maxScale, Math.max(minScale, scale + delta));
    applyTransform();
  }, {passive:false});

  /* Touch events */
  viewport.addEventListener("touchstart", function(e){
    if(e.touches.length===1){
      dragging=true; lastX=e.touches[0].clientX; lastY=e.touches[0].clientY;
    } else if(e.touches.length===2){
      dragging=false; pinchStartDist=touchDist(e.touches); pinchStartScale=scale;
    }
  }, {passive:true});
  viewport.addEventListener("touchmove", function(e){
    if(e.touches.length===1 && dragging){
      panX += e.touches[0].clientX-lastX; panY += e.touches[0].clientY-lastY;
      lastX=e.touches[0].clientX; lastY=e.touches[0].clientY; applyTransform();
    } else if(e.touches.length===2 && pinchStartDist){
      var d = touchDist(e.touches);
      scale = Math.min(maxScale, Math.max(minScale, pinchStartScale*(d/pinchStartDist)));
      applyTransform();
    }
  }, {passive:true});
  viewport.addEventListener("touchend", function(e){
    if(e.touches.length<2) pinchStartDist=null;
    if(e.touches.length===0) dragging=false;
  });
  function touchDist(t){
    var dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY;
    return Math.sqrt(dx*dx+dy*dy);
  }

  /* Zoom buttons */
  document.getElementById("zoomIn").addEventListener("click", function(){ scale=Math.min(maxScale,scale+0.25); applyTransform(); });
  document.getElementById("zoomOut").addEventListener("click", function(){ scale=Math.max(minScale,scale-0.25); applyTransform(); });
  document.getElementById("zoomReset").addEventListener("click", resetView);

  /* ================= Floor navigation ================= */
  var currentFloor = 1;

  function setActiveFloorBtn(n){
    document.querySelectorAll(".floor-btn[data-floor]").forEach(function(b){
      b.classList.toggle("is-active", b.getAttribute("data-floor") === String(n));
    });
  }

  function openFloor(n){
    currentFloor = n;
    var f = floors[n];
    document.getElementById("floorNum").textContent = String(n).padStart(2,"0");
    document.getElementById("floorName").textContent = lang==="th"?f.th:f.en;

    var imgEl = document.getElementById("mapImage");
    imgEl.onload = function(){ resetView(); };
    imgEl.src = floorImages[n];
    imgEl.alt = (lang==="th"?f.th:f.en) + " — " + (lang==="th"?"แผนผังอาคารรัฐสีมาคุณากร":"Rat Sima Khunakon Building floor plan");

    resetView();
    setActiveFloorBtn(n);
    updateQR();
  }

  document.querySelectorAll(".floor-btn[data-floor]").forEach(function(btn){
    btn.addEventListener("click", function(){
      openFloor(parseInt(btn.getAttribute("data-floor"),10));
    });
  });

  /* Recalculate on resize */
  var resizeTimer;
  window.addEventListener("resize", function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resetView, 120);
  });

  /* Listen to hash changes (for mobile / URL direct access) */
  window.addEventListener("hashchange", function(){
    if(location.hash.indexOf("#floor-") === 0){
      var m = location.hash.match(/floor-(\d)/);
      if(m){
        var f = parseInt(m[1],10);
        if(f >= 1 && f <= 5 && f !== currentFloor) openFloor(f);
      }
    }
  });

  /* ================= QR Code & Mobile URL ================= */
  function getKioskTargetUrl(floor){
    if(typeof KIOSK_ONLINE_URL === "string" && KIOSK_ONLINE_URL.trim()){
      var base = KIOSK_ONLINE_URL.trim().replace(/#.*$/, "");
      return base + "#floor-" + floor;
    }
    return location.href.split("#")[0] + "#floor-" + floor;
  }

  function updateQR(){
    var target = getKioskTargetUrl(currentFloor);
    var qrImg = document.getElementById("qrImg");
    var qrModalImg = document.getElementById("qrModalImg");
    var qrModalUrl = document.getElementById("qrModalUrl");

    if(qrModalUrl) qrModalUrl.textContent = target;

    try {
      if(typeof QRCode !== "undefined" && QRCode.generateDataURL){
        var dataUrlSmall = QRCode.generateDataURL(target, 120);
        var dataUrlLarge = QRCode.generateDataURL(target, 240);
        if(qrImg) qrImg.src = dataUrlSmall;
        if(qrModalImg) qrModalImg.src = dataUrlLarge;
        return;
      }
    } catch(err) {
      console.warn("Local QR generator error, using fallback API", err);
    }

    /* Fallback to online API */
    var fallbackUrl = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=" + encodeURIComponent(target);
    if(qrImg) qrImg.src = fallbackUrl;
    if(qrModalImg) qrModalImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=6&data=" + encodeURIComponent(target);
  }

  /* QR Modal Dialog Interaction */
  var qrBlock = document.getElementById("qrBlock");
  var qrModal = document.getElementById("qrModal");
  var qrModalClose = document.getElementById("qrModalClose");
  var qrModalBackdrop = document.getElementById("qrModalBackdrop");
  var qrCopyBtn = document.getElementById("qrCopyBtn");

  function openQRModal(){
    updateQR();
    if(qrModal) qrModal.classList.add("show");
  }
  function closeQRModal(){
    if(qrModal) qrModal.classList.remove("show");
  }

  if(qrBlock) qrBlock.addEventListener("click", openQRModal);
  if(qrModalClose) qrModalClose.addEventListener("click", closeQRModal);
  if(qrModalBackdrop) qrModalBackdrop.addEventListener("click", closeQRModal);

  if(qrCopyBtn){
    qrCopyBtn.addEventListener("click", function(){
      var target = getKioskTargetUrl(currentFloor);
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(target).then(function(){
          var original = qrCopyBtn.textContent;
          qrCopyBtn.textContent = dict.qrCopied[lang];
          setTimeout(function(){ qrCopyBtn.textContent = original; }, 2000);
        });
      } else {
        prompt(lang === "th" ? "คัดลอกลิงก์นี้:" : "Copy this URL:", target);
      }
    });
  }

  /* ================= Clock ================= */
  function tickClock(){
    var d = new Date();
    document.getElementById("clock").textContent =
      String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");
  }
  tickClock(); setInterval(tickClock, 15000);

  /* ================= Idle auto-return ================= */
  var idleTimer, countdownTimer;
  var IDLE_MS = 90*1000, COUNTDOWN = 8;

  function armIdle(){
    clearTimeout(idleTimer); hideIdleToast();
    idleTimer = setTimeout(showIdleToast, IDLE_MS);
  }
  function showIdleToast(){
    if(currentFloor === 1){ armIdle(); return; }
    var n = COUNTDOWN;
    setIdleMessage(n);
    document.getElementById("idleToast").classList.add("show");
    countdownTimer = setInterval(function(){
      n -= 1; setIdleMessage(Math.max(n,0));
      if(n<=0){ clearInterval(countdownTimer); hideIdleToast(); openFloor(1); }
    }, 1000);
  }
  function hideIdleToast(){
    clearInterval(countdownTimer);
    document.getElementById("idleToast").classList.remove("show");
  }
  document.getElementById("idleStay").addEventListener("click", function(){ hideIdleToast(); armIdle(); });
  ["mousedown","touchstart","wheel","keydown"].forEach(function(evt){
    window.addEventListener(evt, armIdle, {passive:true});
  });

  /* ================= Boot ================= */
  applyI18n();
  var bootFloor = 1;
  if(location.hash.indexOf("#floor-") === 0){
    var m = location.hash.match(/floor-(\d)/);
    if(m) bootFloor = parseInt(m[1],10);
  }
  openFloor(bootFloor);
  armIdle();
