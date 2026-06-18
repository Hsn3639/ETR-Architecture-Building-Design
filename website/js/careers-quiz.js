/* ETR Graduate Assessment — timed, multiple-choice, scored, anti-cheat.
 * English by design (the exam tests English + industry knowledge).
 * Delivers the score, time and integrity flags to Formspree (if configured)
 * or a pre-filled mailto. Anti-cheat here is a deterrent, not proctoring:
 * shuffled questions/options, live timer + hard time limit, tab-switch
 * detection, copy/paste/context-menu blocking, unload warning, one-attempt flag.
 */
(function () {
  var CFG = (typeof window !== "undefined" && window.ETR_CONFIG) || {};
  var FORMSPREE = CFG.FORMSPREE_ENDPOINT || "";
  var EMAIL = CFG.CONTACT_EMAIL || "hsn.importazioni@outlook.com";
  var LIMIT_MIN = 30;            // hard time limit → auto-submit
  var PASS = 0.6;                // 60% band threshold

  // ---- Question bank: {c: category, q, o: options, a: index of correct option} ----
  var BANK = [
    {c:"English",q:"Choose the correctly written sentence.",o:["The wall, it gets too hot in summer so we cool it.","In summer the wall overheats, so we propose passive cooling.","Wall too hot summer, cooling needed maybe.","The hot wall is happening in the summer time period."],a:1},
    {c:"English",q:"'Fenestration' refers to the arrangement of…",o:["staircases","windows and openings","roof beams","drainage pipes"],a:1},
    {c:"English",q:"'Massing' describes a building's…",o:["overall 3D form and volume","interior colour scheme","cost estimate","legal ownership"],a:0},
    {c:"English",q:"The most concise rewrite of 'due to the fact that' is…",o:["owing to the fact","because","in light of the reason","as a result of which"],a:1},
    {c:"English",q:"'Articulation' of a facade means its…",o:["total height","expression of parts, joints and detail","market value","fire rating"],a:1},
    {c:"English",q:"Which is the correct professional term for drawings issued for pricing by contractors?",o:["tender documents","mood board","site diary","punch pad"],a:0},
    {c:"English",q:"An 'RFI' on a project is a…",o:["Request for Information","Roof Framing Inspection","Rapid Finish Install","Register of Fixed Items"],a:0},
    {c:"English",q:"'Snagging' refers to…",o:["listing and fixing minor defects before handover","negotiating the fee","surveying the land","ordering materials"],a:0},
    {c:"Design",q:"A 'parti' in architecture is the…",o:["central organising idea of a scheme","building permit","cost plan","door schedule"],a:0},
    {c:"Design",q:"'Negative space' (void) in a composition is…",o:["a structural failure","the deliberate empty space between elements","wasted budget","an unbuilt plot"],a:1},
    {c:"Design",q:"Which best defines 'genius loci'?",o:["the spirit/character of a place","a famous architect","a load calculation","a software plug-in"],a:0},
    {c:"Design",q:"'Tectonics' in architecture concerns…",o:["earthquakes only","the artful expression of structure and construction","interior styling","land law"],a:1},
    {c:"Design",q:"The difference between 'vernacular' and 'contextual' design is that vernacular is…",o:["always modern","traditional/local building practice, while contextual responds to a specific site","more expensive","only for museums"],a:1},
    {c:"Design",q:"Good circulation design primarily ensures that a building…",o:["uses the most materials","reads intuitively and moves people clearly","has the smallest windows","avoids any corridors"],a:1},
    {c:"Design",q:"Human scale in design is controlled mainly through…",o:["proportion and dimensions relative to the body","paint colour","the client's budget","the roof slope"],a:0},
    {c:"Building science",q:"A curtain wall is…",o:["a load-bearing stone wall","a non-load-bearing external cladding system","an internal partition only","a retaining wall"],a:1},
    {c:"Building science",q:"'Thermal mass' helps comfort by…",o:["reflecting all light","absorbing and slowly releasing heat to flatten temperature swings","blocking ventilation","increasing humidity"],a:1},
    {c:"Building science",q:"A 'thermal bridge' is…",o:["a path of heat loss through a conductive element","a type of footbridge","a cooling fan","a window blind"],a:0},
    {c:"Building science",q:"Lower U-value means…",o:["worse insulation","better insulation (less heat transfer)","higher cost always","more glazing"],a:1},
    {c:"Building science",q:"The 'dew point' matters because below it…",o:["concrete cures faster","water vapour condenses, risking damp and decay","paint dries instantly","steel expands"],a:1},
    {c:"Building science",q:"A ventilated (rainscreen) facade primarily…",o:["adds weight for stability","manages moisture and improves the envelope's performance","is purely decorative","replaces the structure"],a:1},
    {c:"Building science",q:"Which is a LATERAL load?",o:["weight of the slab (dead)","furniture and people (live)","wind or seismic force","paint finish"],a:2},
    {c:"Building science",q:"An expansion joint is provided to…",o:["decorate the facade","allow movement and prevent cracking","carry electrical cables","support the roof garden"],a:1},
    {c:"Building science",q:"For a flat roof in a hot climate, the priority is…",o:["a steep pitch","reliable waterproofing + insulation + drainage falls","timber shingles","no membrane at all"],a:1},
    {c:"Building science",q:"'Dead load' refers to…",o:["temporary occupants","the permanent self-weight of the structure","wind pressure","snow only"],a:1},
    {c:"Building science",q:"A reasonable structural choice for a 4-storey mixed-use building is…",o:["timber shingles","a reinforced-concrete or steel frame","mud brick only","a tensile fabric tent"],a:1},
    {c:"Sustainability",q:"'Passive cooling' means cooling…",o:["with large air-conditioners","through design (shading, ventilation, mass) with little/no energy","by painting roofs black","by adding more glazing"],a:1},
    {c:"Sustainability",q:"A courtyard cools a building mainly by…",o:["blocking all air","creating shade and promoting airflow and night radiation","trapping heat","raising humidity only"],a:1},
    {c:"Sustainability",q:"A wind catcher / wind tower works by…",o:["burning fuel","channelling prevailing wind and exhausting warm air by buoyancy","pumping water","storing electricity"],a:1},
    {c:"Sustainability",q:"Evaporative cooling is MOST effective in air that is…",o:["hot and humid","hot and dry","cold and wet","cool and humid"],a:1},
    {c:"Sustainability",q:"'Embodied carbon' is the carbon associated with…",o:["running the building's systems","making and transporting its materials","the occupants' commute","the design fee"],a:1},
    {c:"Sustainability",q:"Which is a recognised green-building rating system?",o:["LEED","ISO 9000","RAL","Pantone"],a:0},
    {c:"Sustainability",q:"A reflective (cool) roof reduces cooling load by…",o:["absorbing more sun","reflecting solar radiation and lowering surface temperature","adding thermal mass only","increasing the U-value"],a:1},
    {c:"Sustainability",q:"On a hot coastal site, a key passive move is to…",o:["maximise unshaded west glazing","orient and shade to cut solar gain and use sea breezes","seal all openings permanently","remove all insulation"],a:1},
    {c:"Sustainability",q:"'Design for disassembly' supports a circular economy by…",o:["gluing everything permanently","enabling parts to be separated, reused or recycled","using only concrete","ignoring material choice"],a:1},
    {c:"Sustainability",q:"The 'urban heat island' effect is when…",o:["cities are cooler than rural areas","dense built-up areas are hotter than their surroundings","deserts cool at night","glass reduces heat"],a:1},
    {c:"Sustainability",q:"To keep comfort during a power cut, the best design strategy is…",o:["rely entirely on AC","high thermal mass, shading, insulation and natural ventilation","more electric heaters","larger generators only"],a:1},
    {c:"Software/BIM",q:"BIM stands for…",o:["Building Information Modelling","Basic Interior Mapping","Bulk Item Management","Brick Installation Method"],a:0},
    {c:"Software/BIM",q:"The key difference between BIM and 2D CAD drafting is that BIM…",o:["only draws lines","uses an intelligent 3D model with data","cannot produce drawings","is paper-only"],a:1},
    {c:"Software/BIM",q:"'LOD' (Level of Development) describes…",o:["lighting design only","how developed/reliable model elements are","land ownership data","labour costs"],a:1},
    {c:"Software/BIM",q:"'Clash detection' is used to…",o:["pick paint colours","find conflicts between systems (e.g. duct vs beam) before construction","calculate tax","measure daylight"],a:1},
    {c:"Software/BIM",q:"Which pairing is for parametric/generative design?",o:["Rhino + Grasshopper","Excel + Outlook","Photoshop + Acrobat","Word + PowerPoint"],a:0},
    {c:"Software/BIM",q:"A 'digital twin' is…",o:["a backup printer","a live virtual model linked to a real asset for operation","a duplicate site","a render style"],a:1},
    {c:"Software/BIM",q:"Which is primarily a BIM authoring tool?",o:["Revit","WhatsApp","Slack","Notepad"],a:0},
    {c:"Heritage/urbanism",q:"'Adaptive reuse' means…",o:["demolishing and rebuilding","repurposing an existing building for a new use","copying a historic style","painting a facade"],a:1},
    {c:"Heritage/urbanism",q:"'Restoration' differs from 'renovation' in that restoration aims to…",o:["modernise freely","return a building to a known earlier state accurately","increase floor area","cut all costs"],a:1},
    {c:"Heritage/urbanism",q:"A 'figure-ground' plan reveals…",o:["soil type","the relationship of built mass to open/public space","electrical loads","wind speed"],a:1},
    {c:"Heritage/urbanism",q:"A 'masterplan' primarily sets…",o:["the paint schedule","the long-term spatial framework for development","one room's layout","the furniture list"],a:1},
    {c:"Heritage/urbanism",q:"Intervening sensitively in historic fabric usually means…",o:["matching nothing and maximising contrast everywhere","respecting character while making new work legible and reversible where possible","demolishing context","hiding all new elements"],a:1},
    {c:"Heritage/urbanism",q:"Italian-era planning notably shaped which Libyan city's downtown fabric?",o:["Benghazi","Timbuktu","Cairo","Tunis"],a:0},
    {c:"Practice",q:"In construction documents, a 'specification' defines…",o:["quantities only","the quality/standards of materials and workmanship","the site boundary","the fee"],a:1},
    {c:"Practice",q:"A 'schedule' (e.g. door/window schedule) is…",o:["a project calendar only","a structured list of components and their data","a contract clause","a soil report"],a:1},
    {c:"Practice",q:"'Handover' is the stage where the building is…",o:["first designed","completed and transferred to the client","demolished","valued for tax"],a:1},
    {c:"Practice",q:"'Value engineering' aims to…",o:["always pick the cheapest option","optimise value — function vs cost — without losing essential quality","increase the fee","delay the project"],a:1},
    {c:"Practice",q:"Construction 'supervision' mainly ensures work is built…",o:["faster regardless of quality","to the drawings, specification and standards","without any inspection","by the architect personally"],a:1},
    {c:"Practice",q:"A site 'datum' is…",o:["a fixed reference point/level for measurements","a type of crane","a paint brand","a contract type"],a:0},
    {c:"Practice",q:"'Tolerance' in construction means…",o:["zero deviation ever","the permissible deviation from a specified dimension","ignoring drawings","extra budget"],a:1},
    {c:"Practice",q:"Which sequence is correct?",o:["Concept → Design development → Construction documents → Tender → Construction","Tender → Concept → Construction → Design","Construction → Concept → Tender","Handover → Concept → Design"],a:0},
    {c:"Design",q:"When does ornament become justified rather than mere decoration?",o:["never","when it expresses structure, function, identity or meaning","only if expensive","only on roofs"],a:1},
    {c:"Building science",q:"Cross-ventilation requires…",o:["a single small window","openings on differing pressure sides to drive airflow","sealed rooms","no openings"],a:1},
    {c:"Sustainability",q:"Night purging (night-time ventilation) works best paired with…",o:["low thermal mass","high thermal mass to absorb daytime heat","no insulation","west-facing glass"],a:1},
    {c:"Building science",q:"Shading is generally MOST critical on which facades in the northern hemisphere hot climate?",o:["north only","south and west","underground","roofs never"],a:1},
    {c:"Practice",q:"A 'BOQ' is a…",o:["Bill of Quantities","Board of Quality","Building Orientation Quotient","Basic Office Quote"],a:0},
    {c:"Design",q:"An axonometric drawing is…",o:["a 2D plan only","a 3D pictorial projection keeping parallel lines","a cost sheet","a soil section"],a:1},
    {c:"Sustainability",q:"Daylighting design aims to…",o:["maximise glare","provide useful natural light while controlling heat and glare","remove all windows","use only artificial light"],a:1},
    {c:"Heritage/urbanism",q:"'Conservation' of heritage emphasises…",o:["free modernisation","protecting and maintaining significance with minimal intervention","total replacement","adding floors"],a:1},
    {c:"Practice",q:"The professional response to a clear discrepancy between plan and section on site is to…",o:["guess and continue","raise an RFI and resolve it before building","ignore the section","tell no one"],a:1},
    {c:"Scenario",q:"A client demands full west-facing glazing in a desert climate. The best response is to…",o:["agree without comment","explain the heat-gain risk and propose shading, glazing specs and orientation tweaks","refuse the project","double the AC silently"],a:1},
    {c:"Scenario",q:"If the budget is cut 25% mid-design, you should first protect…",o:["decorative finishes","core performance: structure, envelope and climate response","the largest chandelier","extra parking"],a:1},
    {c:"Scenario",q:"You believe a senior's detail will fail technically. You should…",o:["stay silent","raise it professionally with evidence and propose an alternative","build it anyway","resign"],a:1}
  ];

  function shuffle(a){ for (var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function el(t,c,txt){ var e=document.createElement(t); if(c)e.className=c; if(txt!=null)e.textContent=txt; return e; }
  function pad(n){ return (n<10?"0":"")+n; }

  var startTs=0, finished=false, timer=null, blurCount=0, order=[];

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("careers-form");
    var startBtn = document.getElementById("start-btn");
    var quiz = document.getElementById("quiz");
    var meta = document.getElementById("quiz-meta");
    var timerEl = document.getElementById("quiz-timer");
    var progEl = document.getElementById("quiz-progress");
    var actions = document.getElementById("quiz-actions");
    var submitBtn = document.getElementById("submit-quiz");
    var result = document.getElementById("quiz-result");
    var statusEl = document.getElementById("careers-status");
    if (!form || !startBtn || !quiz) return;

    // One-attempt deterrent
    try { if (localStorage.getItem("etr_exam_done")) { startBtn.textContent = "Assessment already completed on this device"; } } catch(e){}

    function tick() {
      var s = Math.floor((Date.now() - startTs) / 1000);
      var rem = LIMIT_MIN * 60 - s;
      if (rem <= 0) { submit(true); return; }
      timerEl.textContent = pad(Math.floor(rem/60)) + ":" + pad(rem%60);
      if (rem <= 60) timerEl.classList.add("low");
    }

    function render() {
      order = shuffle(BANK.map(function(_,i){return i;}));
      quiz.innerHTML = "";
      order.forEach(function (qi, n) {
        var item = BANK[qi];
        var block = el("div","q-item");
        var label = el("div","quiz-q");
        label.innerHTML = '<span class="quiz-no">' + pad(n+1) + '</span><span class="quiz-cat">' + item.c + '</span>' + item.q;
        block.appendChild(label);
        var opts = el("div","quiz-opts");
        var idxs = shuffle(item.o.map(function(_,i){return i;}));
        idxs.forEach(function (oi) {
          var id = "q"+n+"_"+oi;
          var wrap = el("label","quiz-opt");
          var input = document.createElement("input");
          input.type="radio"; input.name="qz"+n; input.id=id; input.value=item.o[oi];
          input.setAttribute("data-correct", item.o[oi] === item.o[item.a] ? "1" : "0");
          var span = el("span",null,item.o[oi]);
          wrap.appendChild(input); wrap.appendChild(span);
          opts.appendChild(wrap);
        });
        block.appendChild(opts);
        quiz.appendChild(block);
      });
      progEl.textContent = "0 / " + BANK.length;
      quiz.addEventListener("change", function(){
        var answered = quiz.querySelectorAll('input[type=radio]:checked').length;
        progEl.textContent = answered + " / " + BANK.length;
      });
    }

    startBtn.addEventListener("click", function () {
      if (!form.elements["name"].value.trim() || !form.elements["contact"].value.trim()) {
        statusEl.textContent = "Please enter your name and contact before starting.";
        return;
      }
      statusEl.textContent = "";
      // lock applicant fields
      ["name","contact","portfolio","location"].forEach(function(n){ if(form.elements[n]) form.elements[n].readOnly=true; });
      startBtn.hidden = true;
      render();
      quiz.hidden = false; meta.hidden = false; actions.hidden = false;
      startTs = Date.now(); finished = false;
      tick(); timer = setInterval(tick, 1000);
      window.addEventListener("beforeunload", unloadGuard);
    });

    function unloadGuard(e){ if(!finished){ e.preventDefault(); e.returnValue=""; return ""; } }

    // anti-cheat: count tab/window switches once started
    document.addEventListener("visibilitychange", function(){ if(startTs && !finished && document.hidden) blurCount++; });
    window.addEventListener("blur", function(){ if(startTs && !finished) blurCount++; });
    // deter copy/paste/right-click within the quiz
    ["copy","cut","paste","contextmenu"].forEach(function(ev){
      quiz.addEventListener(ev, function(e){ e.preventDefault(); });
    });

    function submit(auto) {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      window.removeEventListener("beforeunload", unloadGuard);
      var elapsed = Math.min(Math.floor((Date.now()-startTs)/1000), LIMIT_MIN*60);

      var correct = 0, answered = 0, picks = [];
      order.forEach(function (qi, n) {
        var sel = quiz.querySelector('input[name="qz'+n+'"]:checked');
        if (sel) { answered++; if (sel.getAttribute("data-correct")==="1") correct++; picks.push((n+1)+":"+sel.value); }
        else picks.push((n+1)+":—");
      });
      var pct = Math.round(correct / BANK.length * 100);
      var band = pct >= 80 ? "Excellent" : pct >= Math.round(PASS*100) ? "Strong" : "Developing";
      var mins = Math.floor(elapsed/60), secs = elapsed%60;

      // candidate result
      result.hidden = false;
      document.getElementById("rq-score").textContent = correct + " / " + BANK.length + "  (" + pct + "%)";
      document.getElementById("rq-band").textContent = band;
      document.getElementById("rq-time").textContent = pad(mins)+":"+pad(secs) + (auto ? "  (time limit reached)" : "");
      quiz.hidden = true; actions.hidden = true; meta.hidden = true;
      result.scrollIntoView({behavior:"smooth"});
      try { localStorage.setItem("etr_exam_done","1"); } catch(e){}

      // deliver to ETR
      var data = {
        name: form.elements["name"].value, contact: form.elements["contact"].value,
        portfolio: form.elements["portfolio"].value, location: form.elements["location"].value,
        score: correct + "/" + BANK.length, percent: pct + "%", band: band,
        time_taken: pad(mins)+":"+pad(secs), auto_submitted: auto ? "yes" : "no",
        tab_switches: String(blurCount), answered: answered + "/" + BANK.length,
        answers: picks.join(" | ")
      };
      var subject = "Graduate assessment result — ETR (" + (data.name||"") + ") — " + pct + "%";
      if (FORMSPREE) {
        statusEl.textContent = "Submitting…";
        fetch(FORMSPREE, { method:"POST", headers:{ "Accept":"application/json","Content-Type":"application/json" },
          body: JSON.stringify(Object.assign({ subject: subject }, data)) })
          .then(function(r){ statusEl.textContent = r.ok ? "Your result has been submitted to ETR." : ("Couldn't submit automatically — email us at " + EMAIL + "."); })
          .catch(function(){ statusEl.textContent = "Couldn't submit automatically — email us at " + EMAIL + "."; });
      } else {
        var body = Object.keys(data).map(function(k){ return k+": "+data[k]; }).join("\n");
        window.location.href = "mailto:"+EMAIL+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
        statusEl.textContent = "Opening your email client to send the result to ETR…";
      }
    }

    submitBtn.addEventListener("click", function(){ submit(false); });
  });
})();
