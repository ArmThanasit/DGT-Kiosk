/* =========================================================
   room.js
   Room data, translations, global search, category filter
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

  /* ================= Room data ================= */
  function seq(prefix, from, to){
    var out = [];
    for(var i=from;i<=to;i++) out.push(prefix+i);
    return out;
  }

  var floors = {
    1: { th:"ชั้น 1", en:"Floor 1", rooms: [].concat(
        [1,2,3,4,5,6,7,8,9,10].map(function(i){
          return {code:"B61"+String(i).padStart(2,"0")+"-A", name:"ห้องเรียน", cat:"class"};
        }),
        [
          {code:"A", name:"ห้องพักอาจารย์", cat:"office"},
          {code:"H", name:"สำนักงานสำนักวิชาศาสตร์และศิลป์ดิจิทัล (2 จุด)", cat:"office"},
          {code:"C", name:"ห้องงานนวัตกรรมและการบริการ", cat:"office"},
          {code:"D", name:"ห้องเจ้าหน้าที่สื่อโสต", cat:"office"},
          {code:"LS", name:"Learning Space", cat:"common"},
          {code:"", name:"ลิฟต์ (x3)", cat:"facility"},
          {code:"", name:"บันไดเลื่อน (x2)", cat:"facility"},
          {code:"", name:"บันไดหนีไฟ (x4)", cat:"facility"},
          {code:"", name:"ทางลาดวีลแชร์ (x2)", cat:"facility"},
          {code:"", name:"ห้องน้ำ (x2)", cat:"facility"}
        ]
      )
    },
    2: { th:"ชั้น 2", en:"Floor 2", rooms: [].concat(
        seq("DL",1,9).map(function(c){return {code:c, name:"ห้องปฏิบัติการเทคโนโลยีดิจิทัล", cat:"lab"};}),
        [{code:"DL19", name:"ห้องปฏิบัติการเทคโนโลยีดิจิทัล", cat:"lab"}],
        [{code:"SE1", name:"ห้องบริการเทคโนโลยีดิจิทัล", cat:"lab"},
         {code:"SE2", name:"ห้องบริการเทคโนโลยีดิจิทัล", cat:"lab"},
         {code:"S", name:"ห้องปฏิบัติการเสียง", cat:"lab"},
         {code:"SP", name:"ห้องปฏิบัติการด้านลำดับภาพและเสียง", cat:"lab"},
         {code:"I", name:"สำนักงานศูนย์นวัตกรรมและเทคโนโลยีการศึกษา (2 จุด)", cat:"office"},
         {code:"I1", name:"สตูดิโอถ่ายภาพ", cat:"studio"},
         {code:"I2", name:"ห้องประเมินประสิทธิภาพการสอน", cat:"office"},
         {code:"C", name:"Creative Media & Innovation Space", cat:"studio"},
         {code:"D1", name:"สตูดิโอผลิตแอนิเมชั่นขั้นสูง", cat:"studio"},
         {code:"D2", name:"ห้องปฏิบัติการคอมพิวเตอร์กราฟิก", cat:"lab"},
         {code:"D3", name:"ห้องปฏิบัติการด้านสื่อปฏิสัมพันธ์", cat:"lab"},
         {code:"A", name:"ห้องพักอาจารย์", cat:"office"},
         {code:"", name:"ลิฟต์ (x2)", cat:"facility"},
         {code:"", name:"บันไดเลื่อน", cat:"facility"},
         {code:"", name:"บันไดหนีไฟ (x2)", cat:"facility"},
         {code:"", name:"ห้องน้ำ (x2)", cat:"facility"}]
      )
    },
    3: { th:"ชั้น 3", en:"Floor 3", rooms: [].concat(
        seq("DL",10,18).map(function(c){return {code:c, name:"ห้องปฏิบัติการเทคโนโลยีดิจิทัล", cat:"lab"};}),
        seq("PS",1,6).map(function(c){return {code:c, name:"ห้องปฏิบัติการบริหารจัดการคลังสื่อดิจิทัล", cat:"lab"};}),
        seq("T",1,4).map(function(c){return {code:c, name:"ห้องสตูดิโอบันทึกเสียง", cat:"studio"};}),
        seq("G",1,4).map(function(c){return {code:c, name:"ห้องผลิตสื่อการสอนด้วยตัวเอง", cat:"studio"};}),
        [
          {code:"D1", name:"ห้องปฏิบัติการเทคโนโลยีดิจิทัลเชิงนวัตกรรมขั้นสูง", cat:"lab"},
          {code:"D2", name:"ห้องปฏิบัติการธุรกิจอัจฉริยะและการวิเคราะห์ข้อมูล", cat:"lab"},
          {code:"D3", name:"ห้องปฏิบัติการไซเบอร์สเปซและความมั่นคงปลอดภัยไซเบอร์", cat:"lab"},
          {code:"DS", name:"ห้องปฏิบัติการด้านการผลิตรายการดิจิทัล", cat:"studio"},
          {code:"DS", name:"ห้องปฏิบัติการด้านการผลิตรายการดิจิทัลขนาดเล็ก", cat:"studio"},
          {code:"VL", name:"ห้องปฏิบัติการด้านเทคโนโลยีเสมือนจริง", cat:"lab"},
          {code:"R", name:"ห้องปฏิบัติการวิจัยเทคโนโลยีสื่อดิจิทัล", cat:"lab"},
          {code:"K", name:"ห้องควบคุมทางเทคนิค", cat:"office"},
          {code:"S", name:"ห้องคัดเลือกสื่อดิจิทัล", cat:"lab"},
          {code:"N", name:"ห้องปฏิบัติการตรวจสอบคุณภาพสื่อ", cat:"lab"},
          {code:"V", name:"ห้องปฏิบัติการด้านเสียงขั้นสูง", cat:"lab"},
          {code:"", name:"ลิฟต์ (x2)", cat:"facility"},
          {code:"", name:"บันไดเลื่อน", cat:"facility"},
          {code:"", name:"บันไดหนีไฟ (x2)", cat:"facility"},
          {code:"", name:"ห้องน้ำ (x2)", cat:"facility"}
        ]
      )
    },
    4: { th:"ชั้น 4", en:"Floor 4", rooms: [
        {code:"CCS", name:"สำนักงานศูนย์คอมพิวเตอร์ (หลายห้อง)", cat:"office"},
        {code:"M1", name:"ห้องประชุมสิริคุณากร", cat:"meeting"},
        {code:"M2", name:"ห้องประชุมสีมาดิจิทัล", cat:"meeting"},
        {code:"M3", name:"ห้องประชุมคุณากรรัตน์", cat:"meeting"},
        {code:"O", name:"ห้องประชุมทางไกล", cat:"meeting"},
        {code:"ST1", name:"Studio Control Room 1", cat:"studio"},
        {code:"ST2", name:"Digital Studio 2", cat:"studio"},
        {code:"ST3", name:"Digital Studio 3", cat:"studio"},
        {code:"I", name:"สำนักงานศูนย์นวัตกรรมและเทคโนโลยีการศึกษา (หลายห้อง)", cat:"office"},
        {code:"", name:"ลิฟต์ (x2)", cat:"facility"},
        {code:"", name:"บันไดเลื่อน", cat:"facility"},
        {code:"", name:"บันไดหนีไฟ (x2)", cat:"facility"},
        {code:"", name:"ห้องน้ำ (x2)", cat:"facility"}
      ]
    },
    5: { th:"ชั้น 5", en:"Floor 5", rooms: [
        {code:"B6501-A", name:"ห้องเรียน", cat:"class"},
        {code:"B6502-A", name:"ห้องเรียน", cat:"class"},
        {code:"B6503-A", name:"ห้องเรียน", cat:"class"},
        {code:"MIS", name:"สถานส่งเสริมและพัฒนาระบบสารสนเทศเพื่อการจัดการ (หลายห้อง)", cat:"office"},
        {code:"LS", name:"Learning Space", cat:"common"},
        {code:"", name:"ลิฟต์ (x2)", cat:"facility"},
        {code:"", name:"บันไดเลื่อน", cat:"facility"},
        {code:"", name:"บันไดหนีไฟ (x2)", cat:"facility"},
        {code:"", name:"ห้องน้ำ (x2)", cat:"facility"}
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
          openFloor(item.floor);
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
