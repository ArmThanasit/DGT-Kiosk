/* =========================================================
   room.js
   Room data with exact map coordinates, translations, global search, category filter
   ========================================================= */

  var lang = "th";

  /* ================= i18n dictionary ================= */
  var dict = {
    brandName:    {th:"อาคารรัฐสีมาคุณากร", en:"Rat Sima Khunakon Building"},
    brandSub:     {th:"SUT · RAT SIMA KHUNAKON (DIGITAL) BUILDING", en:"SUT · RAT SIMA KHUNAKON (DIGITAL) BUILDING"},
    searchPh:     {th:"ค้นหาห้อง เช่น B6105 หรือ ห้องประชุม", en:"Search rooms, e.g. B6105 or Meeting room"},
    reset:        {th:"รีเซ็ต", en:"Reset"},
    mapNote:      {th:"ลากเพื่อเลื่อน · จีบนิ้วหรือใช้ปุ่ม +/− เพื่อซูม", en:"Drag to pan · Pinch or use +/− to zoom"},
    deptPhone:    {th:"ศูนย์บริการการศึกษา", en:"Center for Educational Services"},
    deptMail:     {th:"ฝ่ายบริหารระบบ", en:"System Administration"},
    deptLoc:      {th:"ศูนย์บริการคอมพิวเตอร์ ชั้น 2", en:"Center for Computer Services, 2nd Floor"},
    deptLocSub:   {th:"Center for Computer Services", en:"Center for Computer Services"},
    qrHint:       {th:"สแกนเพื่อดูแผนผังนี้บนมือถือของคุณ", en:"Scan to view this map on your phone"},
    idleStay:     {th:"ใช้งานต่อ", en:"Keep using"},
    noResults:    {th:"ไม่พบห้องที่ตรงกัน", en:"No matching rooms found"},
    filterAll:    {th:"ทั้งหมด", en:"All categories"},
    focus:        {th:"โฟกัส", en:"Focus"},
    qrModalTitle: {th:"ดูแผนผังบนมือถือ", en:"View Map on Mobile"},
    qrModalDesc:  {th:"สแกน QR Code ด้วยกล้องมือถือเพื่อเปิดแผนผังชั้นนี้", en:"Scan this QR Code with your mobile camera to open this floor map."},
    qrCopyLink:   {th:"คัดลอกลิงก์", en:"Copy Link"},
    qrCopied:     {th:"คัดลอกแล้ว!", en:"Copied!"}
  };

  /* ================= Categories ================= */
  var categories = {
    class:   {svg:"book",    color:"#C1592B", th:"ห้องเรียน",              en:"Classrooms"},
    lab:     {svg:"flask",   color:"#2F6FA8", th:"ห้องปฏิบัติการ",          en:"Labs"},
    office:  {svg:"folder",  color:"#9E7542", th:"สำนักงาน / ห้องพัก",     en:"Offices"},
    meeting: {svg:"chat",    color:"#B5486B", th:"ห้องประชุม",             en:"Meeting rooms"},
    studio:  {svg:"clapper", color:"#2E8A76", th:"สตูดิโอ / งานสื่อ",       en:"Studios"},
    common:  {svg:"space",   color:"#5D8A3B", th:"พื้นที่ส่วนกลาง",         en:"Common areas"},
    facility:{svg:"lift",    color:"#726A63", th:"สิ่งอำนวยความสะดวก",     en:"Facilities"}
  };

  function catIcon(key){
    return '<svg class="cat-ic" viewBox="0 0 24 24" style="color:'+categories[key].color+'"><use href="#icon-'+categories[key].svg+'"></use></svg>';
  }

  /* ================= Floor Rooms with Exact Floor-Plan Coordinates (x%, y%) ================= */
  var floors = {
    1: {
      th: "ชั้น 1", en: "Floor 1",
      rooms: [
        /* Classrooms Row 1 */
        { code: "B6110-A", name: "ห้องเรียน", cat: "class", x: 17, y: 75 },
        { code: "B6109-A", name: "ห้องเรียน", cat: "class", x: 25, y: 75 },
        { code: "B6108-A", name: "ห้องเรียน", cat: "class", x: 32, y: 75 },
        { code: "B6105-A", name: "ห้องเรียน", cat: "class", x: 65, y: 73 },
        /* Classrooms Row 2 (Bottom) */
        { code: "B6107-A", name: "ห้องเรียน", cat: "class", x: 18, y: 84 },
        { code: "B6106-A", name: "ห้องเรียน", cat: "class", x: 30, y: 84 },
        { code: "B6104-A", name: "ห้องเรียน", cat: "class", x: 55, y: 83 },
        { code: "B6103-A", name: "ห้องเรียน", cat: "class", x: 64, y: 83 },
        { code: "B6102-A", name: "ห้องเรียน", cat: "class", x: 71, y: 83 },
        { code: "B6101-A", name: "ห้องเรียน", cat: "class", x: 79, y: 83 },
        /* Offices & Spaces */
        { code: "A", name: "ห้องพักอาจารย์", cat: "office", x: 79, y: 71 },
        { code: "D", name: "ห้องเจ้าหน้าที่สื่อโสต", cat: "office", x: 79, y: 75 },
        { code: "H", name: "สำนักงานสำนักวิชาศาสตร์และศิลป์ดิจิทัล (จุดที่ 1)", cat: "office", x: 28, y: 45 },
        { code: "H", name: "สำนักงานสำนักวิชาศาสตร์และศิลป์ดิจิทัล (จุดที่ 2)", cat: "office", x: 32, y: 62 },
        { code: "C", name: "ห้องงานนวัตกรรมและการบริการ", cat: "office", x: 28, y: 53 },
        { code: "LS", name: "Learning Space", cat: "common", x: 65, y: 46 },
        /* Facilities */
        { code: "LIFT", name: "ลิฟต์ (ทางเข้าทิศเหนือ)", cat: "facility", x: 49, y: 49 },
        { code: "LIFT", name: "ลิฟต์ (ฝั่งทิศใต้)", cat: "facility", x: 48, y: 73 },
        { code: "LIFT", name: "ลิฟต์ (ฝั่งทิศตะวันตก)", cat: "facility", x: 11, y: 56 },
        { code: "ESC", name: "บันไดเลื่อน", cat: "facility", x: 48, y: 65 },
        { code: "WC", name: "ห้องน้ำ (ชั้น 1 บน)", cat: "facility", x: 50, y: 54 },
        { code: "WC", name: "ห้องน้ำ (ชั้น 1 ล่าง)", cat: "facility", x: 56, y: 73 }
      ]
    },

    2: {
      th: "ชั้น 2", en: "Floor 2",
      rooms: [
        /* Top Media & Animation */
        { code: "C", name: "Creative Media & Innovation Space", cat: "studio", x: 44, y: 36 },
        { code: "D3", name: "ห้องปฏิบัติการด้านสื่อปฏิสัมพันธ์", cat: "lab", x: 15, y: 42 },
        { code: "D2", name: "ห้องปฏิบัติการคอมพิวเตอร์กราฟิก", cat: "lab", x: 28, y: 42 },
        { code: "D1", name: "สตูดิโอผลิตแอนิเมชั่นขั้นสูง", cat: "studio", x: 41, y: 42 },
        { code: "I1", name: "สตูดิโอถ่ายภาพ", cat: "studio", x: 53, y: 41 },
        { code: "I2", name: "ห้องประเมินประสิทธิภาพการสอน", cat: "office", x: 53, y: 45 },
        { code: "I", name: "สำนักงานศูนย์นวัตกรรมและเทคโนโลยีการศึกษา (จุดที่ 1)", cat: "office", x: 67, y: 42 },
        { code: "I", name: "สำนักงานศูนย์นวัตกรรมและเทคโนโลยีการศึกษา (จุดที่ 2)", cat: "office", x: 67, y: 50 },
        /* Audio & Sound */
        { code: "S", name: "ห้องปฏิบัติการเสียง", cat: "lab", x: 18, y: 54 },
        { code: "SP", name: "ห้องปฏิบัติการด้านลำดับภาพและเสียง", cat: "lab", x: 32, y: 50 },
        { code: "A", name: "ห้องพักอาจารย์ (ฝั่งตะวันตก)", cat: "office", x: 36, y: 50 },
        { code: "A", name: "ห้องพักอาจารย์ (ฝั่งตะวันออก)", cat: "office", x: 69, y: 75 },
        /* Digital Labs */
        { code: "SE2", name: "ห้องบริการเทคโนโลยีดิจิทัล 2", cat: "lab", x: 76, y: 73 },
        { code: "DL19", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 19", cat: "lab", x: 84, y: 73 },
        { code: "DL3", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 3", cat: "lab", x: 17, y: 75 },
        { code: "DL4", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 4", cat: "lab", x: 25, y: 75 },
        { code: "SE1", name: "ห้องบริการเทคโนโลยีดิจิทัล 1", cat: "lab", x: 34, y: 75 },
        { code: "DL2", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 2", cat: "lab", x: 17, y: 86 },
        { code: "DL1", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 1", cat: "lab", x: 25, y: 86 },
        { code: "CCS", name: "Office Lab CCS", cat: "office", x: 34, y: 86 },
        { code: "DL5", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 5", cat: "lab", x: 50, y: 85 },
        { code: "DL6", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 6", cat: "lab", x: 59, y: 85 },
        { code: "DL7", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 7", cat: "lab", x: 67, y: 85 },
        { code: "DL8", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 8", cat: "lab", x: 76, y: 85 },
        { code: "DL9", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 9", cat: "lab", x: 84, y: 85 },
        /* Facilities */
        { code: "LIFT", name: "ลิฟต์", cat: "facility", x: 51, y: 73 },
        { code: "ESC", name: "บันไดเลื่อน", cat: "facility", x: 50, y: 64 },
        { code: "WC", name: "ห้องน้ำ", cat: "facility", x: 59, y: 73 }
      ]
    },

    3: {
      th: "ชั้น 3", en: "Floor 3",
      rooms: [
        /* Media & Studio Section */
        { code: "DS", name: "ห้องปฏิบัติการด้านการผลิตรายการดิจิทัล", cat: "studio", x: 20, y: 48 },
        { code: "DS", name: "ห้องปฏิบัติการด้านการผลิตรายการดิจิทัลขนาดเล็ก", cat: "studio", x: 34, y: 55 },
        { code: "VL", name: "ห้องปฏิบัติการด้านเทคโนโลยีเสมือนจริง", cat: "lab", x: 34, y: 46 },
        { code: "R", name: "ห้องปฏิบัติการวิจัยเทคโนโลยีสื่อดิจิทัล", cat: "lab", x: 42, y: 47 },
        { code: "K", name: "ห้องควบคุมทางเทคนิค", cat: "office", x: 49, y: 48 },
        { code: "S", name: "ห้องคัดเลือกสื่อดิจิทัล", cat: "lab", x: 60, y: 48 },
        { code: "V", name: "ห้องปฏิบัติการด้านเสียงขั้นสูง", cat: "lab", x: 67, y: 47 },
        { code: "PS1", name: "ห้องปฏิบัติการบริหารจัดการคลังสื่อดิจิทัล 1", cat: "lab", x: 51, y: 44 },
        { code: "PS2", name: "ห้องปฏิบัติการบริหารจัดการคลังสื่อดิจิทัล 2", cat: "lab", x: 59, y: 44 },
        { code: "N", name: "ห้องปฏิบัติการตรวจสอบคุณภาพสื่อ", cat: "lab", x: 59, y: 53 },
        { code: "T1", name: "ห้องสตูดิโอบันทึกเสียง 1", cat: "studio", x: 67, y: 53 },
        { code: "T2", name: "ห้องสตูดิโอบันทึกเสียง 2", cat: "studio", x: 75, y: 53 },
        { code: "G1", name: "ห้องผลิตสื่อการสอนด้วยตัวเอง", cat: "studio", x: 83, y: 48 },
        /* Advance Labs */
        { code: "D3", name: "ห้องปฏิบัติการไซเบอร์สเปซและความมั่นคงปลอดภัยไซเบอร์", cat: "lab", x: 17, y: 89 },
        { code: "D2", name: "ห้องปฏิบัติการธุรกิจอัจฉริยะและการวิเคราะห์ข้อมูล", cat: "lab", x: 25, y: 89 },
        { code: "D1", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัลเชิงนวัตกรรมขั้นสูง", cat: "lab", x: 34, y: 89 },
        /* DL Labs */
        { code: "DL18", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 18", cat: "lab", x: 17, y: 78 },
        { code: "DL17", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 17", cat: "lab", x: 25, y: 78 },
        { code: "DL16", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 16", cat: "lab", x: 34, y: 78 },
        { code: "DL10", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 10", cat: "lab", x: 50, y: 87 },
        { code: "DL11", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 11", cat: "lab", x: 59, y: 87 },
        { code: "DL12", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 12", cat: "lab", x: 67, y: 87 },
        { code: "DL13", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 13", cat: "lab", x: 76, y: 87 },
        { code: "DL14", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 14", cat: "lab", x: 84, y: 87 },
        { code: "DL15", name: "ห้องปฏิบัติการเทคโนโลยีดิจิทัล 15", cat: "lab", x: 82, y: 76 },
        /* Facilities */
        { code: "LIFT", name: "ลิฟต์", cat: "facility", x: 51, y: 73 },
        { code: "ESC", name: "บันไดเลื่อน", cat: "facility", x: 50, y: 64 },
        { code: "WC", name: "ห้องน้ำ", cat: "facility", x: 59, y: 73 }
      ]
    },

    4: {
      th: "ชั้น 4", en: "Floor 4",
      rooms: [
        /* Studios & Conferences */
        { code: "ST3", name: "Digital Studio 3", cat: "studio", x: 34, y: 36 },
        { code: "ST2", name: "Digital Studio 2", cat: "studio", x: 34, y: 44 },
        { code: "ST1", name: "Studio Control Room 1", cat: "studio", x: 20, y: 48 },
        { code: "O", name: "ห้องประชุมทางไกล", cat: "meeting", x: 51, y: 35 },
        { code: "I", name: "สำนักงานศูนย์นวัตกรรมและเทคโนโลยีการศึกษา (หลายห้อง)", cat: "office", x: 68, y: 36 },
        { code: "M1", name: "ห้องประชุมสิริคุณากร", cat: "meeting", x: 34, y: 73 },
        { code: "M2", name: "ห้องประชุมสีมาดิจิทัล", cat: "meeting", x: 59, y: 85 },
        { code: "M3", name: "ห้องประชุมคุณากรรัตน์", cat: "meeting", x: 80, y: 85 },
        { code: "CCS", name: "สำนักงานศูนย์คอมพิวเตอร์ (หลายห้อง)", cat: "office", x: 25, y: 73 },
        { code: "CCS", name: "สำนักงานศูนย์คอมพิวเตอร์ (โซนล่าง)", cat: "office", x: 25, y: 86 },
        { code: "CCS", name: "สำนักงานศูนย์คอมพิวเตอร์ (โซนกลาง)", cat: "office", x: 49, y: 85 },
        { code: "CCS", name: "สำนักงานศูนย์คอมพิวเตอร์ (โซนตะวันออก)", cat: "office", x: 70, y: 85 },
        /* Facilities */
        { code: "LIFT", name: "ลิฟต์", cat: "facility", x: 51, y: 73 },
        { code: "ESC", name: "บันไดเลื่อน", cat: "facility", x: 50, y: 64 },
        { code: "WC", name: "ห้องน้ำ", cat: "facility", x: 59, y: 73 }
      ]
    },

    5: {
      th: "ชั้น 5", en: "Floor 5",
      rooms: [
        /* Learning Space */
        { code: "LS", name: "Learning Space", cat: "common", x: 66, y: 37 },
        /* Classrooms */
        { code: "B6501-A", name: "ห้องเรียน", cat: "class", x: 26, y: 79 },
        { code: "B6502-A", name: "ห้องเรียน", cat: "class", x: 47, y: 79 },
        { code: "B6503-A", name: "ห้องเรียน", cat: "class", x: 63, y: 79 },
        /* MIS Office */
        { code: "MIS", name: "สถานส่งเสริมและพัฒนาระบบสารสนเทศเพื่อการจัดการ (ห้องใหญ่)", cat: "office", x: 80, y: 77 },
        { code: "MIS", name: "สถานส่งเสริมและพัฒนาระบบสารสนเทศเพื่อการจัดการ (ห้อง 1)", cat: "office", x: 75, y: 65 },
        { code: "MIS", name: "สถานส่งเสริมและพัฒนาระบบสารสนเทศเพื่อการจัดการ (ห้อง 2)", cat: "office", x: 83, y: 65 },
        /* Facilities */
        { code: "LIFT", name: "ลิฟต์", cat: "facility", x: 51, y: 66 },
        { code: "ESC", name: "บันไดเลื่อน", cat: "facility", x: 50, y: 55 },
        { code: "WC", name: "ห้องน้ำ", cat: "facility", x: 59, y: 66 }
      ]
    }
  };
  var floorOrder = [1,2,3,4,5];

  /* ================= i18n apply ================= */
  function applyI18n(){
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function(el){
      var key = el.getAttribute("data-i18n");
      if(dict[key]) el.textContent = dict[key][lang];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function(el){
      var key = el.getAttribute("data-i18n-ph");
      if(dict[key]) el.placeholder = dict[key][lang];
    });
    document.getElementById("langToggle").textContent = lang === "th" ? "EN" : "TH";
    document.querySelectorAll(".floor-switcher .floor-btn[data-floor]").forEach(function(btn){
      btn.textContent = (lang === "th" ? "ชั้น " : "Floor ") + btn.getAttribute("data-floor");
    });
    if(typeof currentFloor !== "undefined" && currentFloor){
      var f = floors[currentFloor];
      if(f) document.getElementById("floorName").textContent = lang==="th"?f.th:f.en;
    }
    renderFilterPopup();
  }

  document.getElementById("langToggle").addEventListener("click", function(){
    lang = lang === "th" ? "en" : "th";
    applyI18n();
  });

  function setIdleMessage(seconds){
    var text = lang === "th" ? "ไม่มีการใช้งาน — กลับสู่ชั้น 1 ใน " : "No activity — returning to Floor 1 in ";
    var suffix = lang === "th" ? " วิ" : "s";
    document.getElementById("idleMsgEl").textContent = text + seconds + suffix;
  }

  /* ================= Category filter ================= */
  var activeFilter = "all";
  var filterPopup = document.getElementById("filterPopup");
  var filterToggle = document.getElementById("filterToggle");

  function renderFilterPopup(){
    if(!filterPopup) return;
    filterPopup.innerHTML = "";
    /* "All" chip */
    var allBtn = document.createElement("button");
    allBtn.className = "filter-chip" + (activeFilter === "all" ? " active" : "");
    allBtn.textContent = dict.filterAll[lang];
    allBtn.addEventListener("click", function(){ setFilter("all"); });
    filterPopup.appendChild(allBtn);
    /* Category chips */
    Object.keys(categories).forEach(function(key){
      var btn = document.createElement("button");
      btn.className = "filter-chip" + (activeFilter === key ? " active" : "");
      btn.innerHTML = catIcon(key) + " " + categories[key][lang];
      btn.addEventListener("click", function(){ setFilter(key); });
      filterPopup.appendChild(btn);
    });
  }

  function setFilter(cat){
    activeFilter = cat;
    if(filterPopup) filterPopup.classList.remove("show");
    if(filterToggle) filterToggle.classList.toggle("active", cat !== "all");
    renderFilterPopup();
    triggerSearch();
  }

  if(filterToggle){
    filterToggle.addEventListener("click", function(e){
      e.stopPropagation();
      var isOpen = filterPopup.classList.contains("show");
      if(gResults) gResults.classList.remove("show");
      filterPopup.classList.toggle("show", !isOpen);
    });
  }

  /* Close filter popup when clicking outside */
  document.addEventListener("click", function(e){
    if(filterPopup && filterToggle && !filterPopup.contains(e.target) && !filterToggle.contains(e.target)){
      filterPopup.classList.remove("show");
    }
  });

  /* ================= Global search ================= */
  var gInput = document.getElementById("globalSearch");
  var gResults = document.getElementById("globalResults");

  function allRoomsFlat(){
    var out = [];
    floorOrder.forEach(function(n){
      floors[n].rooms.forEach(function(r){
        if(r.code) out.push({floor:n, room:r});
      });
    });
    return out;
  }

  function triggerSearch(){
    if(!gInput || !gResults) return;
    var q = gInput.value.trim().toLowerCase();
    var items = allRoomsFlat();

    /* Apply category filter */
    if(activeFilter !== "all"){
      items = items.filter(function(item){ return item.room.cat === activeFilter; });
    }

    /* Apply text search */
    if(q){
      items = items.filter(function(item){
        return (item.room.code+" "+item.room.name).toLowerCase().indexOf(q) !== -1;
      });
    }

    /* If no query and no filter, hide results */
    if(!q && activeFilter === "all"){
      gResults.classList.remove("show"); gResults.innerHTML = "";
      return;
    }

    var matches = items.slice(0,12);
    gResults.innerHTML = "";

    if(matches.length === 0){
      gResults.innerHTML = '<div class="sr-empty">'+dict.noResults[lang]+'</div>';
    } else {
      matches.forEach(function(item){
        var row = document.createElement("div");
        row.className = "sr-item"; row.tabIndex = 0;
        row.innerHTML =
          '<div class="sr-floor">'+item.floor+'</div>' +
          '<div class="sr-text"><div class="name">'+(item.room.code?item.room.code+" — ":"")+item.room.name+'</div>' +
          '<div class="cat">'+categories[item.room.cat][lang]+' · '+(lang==="th"?floors[item.floor].th:floors[item.floor].en)+'</div></div>';
        row.addEventListener("click", function(){
          gResults.classList.remove("show");
          gInput.value = "";
          openFloor(item.floor, item.room);
        });
        gResults.appendChild(row);
      });
    }
    gResults.classList.add("show");
  }

  if(gInput){
    gInput.addEventListener("input", triggerSearch);
    gInput.addEventListener("keydown", function(e){
      if(e.key === "Escape"){ gInput.value = ""; if(gResults) gResults.classList.remove("show"); gInput.blur(); }
    });
    gInput.addEventListener("focus", function(){ if(filterPopup) filterPopup.classList.remove("show"); });
  }

  /* Close search results when clicking outside */
  document.addEventListener("click", function(e){
    if(gResults && gInput && !gResults.contains(e.target) && e.target !== gInput) gResults.classList.remove("show");
  });
