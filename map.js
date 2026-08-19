/* =========================================================
   map.js
   Floor maps, pan/zoom, room markers & pins, QR, clock, idle timer
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
  var markersContainer = document.getElementById("mapMarkers");
  var scale = 1, minScale = 0.15, maxScale = 4;
  var panX = 0, panY = 0;
  var dragging = false, lastX = 0, lastY = 0;
  var pinchStartDist = null, pinchStartScale = 1;
  var activePinnedRoom = null;

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

  /* Focus & Pan to specific room coordinate */
  function focusOnCoordinate(xPercent, yPercent, targetScale){
    var imgEl = document.getElementById("mapImage");
    var cssWidth = parseInt(getComputedStyle(imgEl).width,10) || 900;
    var renderW = cssWidth;
    var renderH = imgEl.naturalHeight
      ? (cssWidth * imgEl.naturalHeight / imgEl.naturalWidth)
      : (cssWidth * 0.65);

    scale = targetScale || 1.35;
    var offsetX = (xPercent / 100 - 0.5) * renderW;
    var offsetY = (yPercent / 100 - 0.5) * renderH;

    panX = -offsetX * scale;
    panY = -offsetY * scale;

    surface.style.transition = "transform .4s cubic-bezier(0.16, 1, 0.3, 1)";
    applyTransform();
    setTimeout(function(){ surface.style.transition = ""; }, 420);
  }

  /* Mouse events */
  viewport.addEventListener("mousedown", function(e){
    if(e.altKey || e.ctrlKey){
      calibrateClick(e);
      return;
    }
    dragging=true; lastX=e.clientX; lastY=e.clientY; viewport.classList.add("grabbing");
  });
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

  /* Isolate touch events inside popups so iOS scrolling is 100% native and never blocked */
  var fpEl = document.getElementById("filterPopup");
  if(fpEl){
    fpEl.addEventListener("touchstart", function(e){ e.stopPropagation(); }, {passive:true});
    fpEl.addEventListener("touchmove", function(e){ e.stopPropagation(); }, {passive:true});
  }
  var srEl = document.getElementById("globalResults");
  if(srEl){
    srEl.addEventListener("touchstart", function(e){ e.stopPropagation(); }, {passive:true});
    srEl.addEventListener("touchmove", function(e){ e.stopPropagation(); }, {passive:true});
  }

  /* Zoom buttons */
  document.getElementById("zoomIn").addEventListener("click", function(){ scale=Math.min(maxScale,scale+0.25); applyTransform(); });
  document.getElementById("zoomOut").addEventListener("click", function(){ scale=Math.max(minScale,scale-0.25); applyTransform(); });
  document.getElementById("zoomReset").addEventListener("click", function(){
    resetView();
  });

  /* Calibration helper (Alt+Click on map) */
  function calibrateClick(e){
    var imgEl = document.getElementById("mapImage");
    var rect = imgEl.getBoundingClientRect();
    var clickX = e.clientX - rect.left;
    var clickY = e.clientY - rect.top;
    var xPct = Math.max(0, Math.min(100, (clickX / rect.width) * 100)).toFixed(1);
    var yPct = Math.max(0, Math.min(100, (clickY / rect.height) * 100)).toFixed(1);
    var coordStr = "{ x: " + xPct + ", y: " + yPct + " }";
    console.log("📍 [Map Coordinate]", coordStr);
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(coordStr);
    }
  }

  /* ================= Room Highlighting & Pins ================= */
  var roomInfoCard = document.getElementById("roomInfoCard");
  var ricTitle = document.getElementById("ricTitle");
  var ricSub = document.getElementById("ricSub");
  var ricBadge = document.getElementById("ricBadge");
  var ricCatIcon = document.getElementById("ricCatIcon");
  var ricCatName = document.getElementById("ricCatName");
  var ricFocusBtn = document.getElementById("ricFocusBtn");
  var ricCloseBtn = document.getElementById("ricCloseBtn");

  function clearRoomHighlight(){
    activePinnedRoom = null;
    if(markersContainer) markersContainer.innerHTML = "";
    if(roomInfoCard) roomInfoCard.classList.remove("show");
  }

  function highlightRoomOnMap(room){
    if(!room) return;
    activePinnedRoom = room;
    if(markersContainer) markersContainer.innerHTML = "";

    var x = typeof room.x === "number" ? room.x : 50;
    var y = typeof room.y === "number" ? room.y : 50;
    var catInfo = categories[room.cat] || { color: "#DF6E37", th: "ห้อง", en: "Room", svg: "pin" };
    var catColor = catInfo.color || "#DF6E37";

    var pin = document.createElement("div");
    pin.className = "map-pin";
    pin.style.left = x + "%";
    pin.style.top = y + "%";
    pin.style.setProperty("--pin-color", catColor);
    pin.style.setProperty("--glow-color", catColor + "66");

    pin.innerHTML =
      '<div class="map-pin-pulse"></div>' +
      '<div class="map-pin-bubble">' +
        (room.code ? '<span class="pin-code">' + room.code + '</span>' : '') +
        '<span class="pin-name">' + room.name + '</span>' +
      '</div>' +
      '<div class="map-pin-arrow"></div>';

    pin.addEventListener("click", function(e){
      e.stopPropagation();
      focusOnCoordinate(x, y, 1.4);
      if(roomInfoCard) roomInfoCard.classList.add("show");
    });

    markersContainer.appendChild(pin);

    if(roomInfoCard){
      ricTitle.textContent = (room.code ? room.code + " — " : "") + room.name;
      ricSub.textContent = (lang === "th" ? floors[currentFloor].th : floors[currentFloor].en) + " · " + (lang === "th" ? "อาคารรัฐสีมาคุณากร" : "Rat Sima Khunakon Building");
      ricBadge.style.backgroundColor = catColor + "1a";
      ricBadge.style.color = catColor;
      ricCatIcon.innerHTML = catIcon(room.cat);
      ricCatName.textContent = catInfo[lang] || catInfo.th;
      roomInfoCard.classList.add("show");
    }

    setTimeout(function(){
      focusOnCoordinate(x, y, 1.35);
    }, 100);
  }

  if(ricFocusBtn){
    ricFocusBtn.addEventListener("click", function(){
      if(activePinnedRoom){
        focusOnCoordinate(activePinnedRoom.x || 50, activePinnedRoom.y || 50, 1.4);
      }
    });
  }

  if(ricCloseBtn){
    ricCloseBtn.addEventListener("click", function(){
      clearRoomHighlight();
      resetView();
    });
  }

  /* ================= Floor navigation ================= */
  var currentFloor = 1;

  function setActiveFloorBtn(n){
    document.querySelectorAll(".floor-btn[data-floor]").forEach(function(b){
      b.classList.toggle("is-active", b.getAttribute("data-floor") === String(n));
    });
  }

  function openFloor(n, targetRoom){
    currentFloor = n;
    var f = floors[n];
    document.getElementById("floorNum").textContent = String(n).padStart(2,"0");
    document.getElementById("floorName").textContent = lang==="th"?f.th:f.en;

    clearRoomHighlight();

    var imgEl = document.getElementById("mapImage");
    imgEl.onload = function(){
      resetView();
      if(targetRoom){
        highlightRoomOnMap(targetRoom);
      }
    };
    imgEl.src = floorImages[n];
    imgEl.alt = (lang==="th"?f.th:f.en) + " — " + (lang==="th"?"แผนผังอาคารรัฐสีมาคุณากร":"Rat Sima Khunakon Building floor plan");

    resetView();
    setActiveFloorBtn(n);
    updateQR();

    if(targetRoom && imgEl.complete){
      highlightRoomOnMap(targetRoom);
    }
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
    resizeTimer = setTimeout(function(){
      if(!activePinnedRoom) resetView();
    }, 120);
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

    try {
      if(typeof QRCode !== "undefined" && QRCode.generateDataURL){
        /* High-res crisp rendering for large footer QR & modal QR */
        var dataUrlFooter = QRCode.generateDataURL(target, 260);
        var dataUrlModal = QRCode.generateDataURL(target, 340);
        if(qrImg) qrImg.src = dataUrlFooter;
        if(qrModalImg) qrModalImg.src = dataUrlModal;
        return;
      }
    } catch(err) {
      console.warn("Local QR generator error, using fallback API", err);
    }

    /* Fallback to online API */
    var fallbackUrl = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=4&data=" + encodeURIComponent(target);
    if(qrImg) qrImg.src = fallbackUrl;
    if(qrModalImg) qrModalImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=340x340&margin=6&data=" + encodeURIComponent(target);
  }

  /* QR Modal Dialog Interaction */
  var qrBlock = document.getElementById("qrBlock");
  var qrModal = document.getElementById("qrModal");
  var qrModalClose = document.getElementById("qrModalClose");
  var qrModalBackdrop = document.getElementById("qrModalBackdrop");

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
    if(currentFloor === 1 && !activePinnedRoom){ armIdle(); return; }
    var n = COUNTDOWN;
    setIdleMessage(n);
    document.getElementById("idleToast").classList.add("show");
    countdownTimer = setInterval(function(){
      n -= 1; setIdleMessage(Math.max(n,0));
      if(n<=0){
        clearInterval(countdownTimer);
        hideIdleToast();
        clearRoomHighlight();
        openFloor(1);
      }
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
