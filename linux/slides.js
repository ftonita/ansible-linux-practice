/* Linux deck: slide-specific interactivity */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var current = window.deckAPI ? window.deckAPI.get().i : 0;
  document.addEventListener("slide", function (e) { current = e.detail.i; onSlide(); });

  /* --- global view toggle: manual / ansible --- */
  var view = "manual";
  try { view = localStorage.getItem("linux-view") || "manual"; } catch (e) {}
  function setView(v) {
    view = v; document.body.dataset.view = v;
    [].forEach.call(document.querySelectorAll(".viewtabs button"), function (b) {
      b.setAttribute("aria-pressed", b.dataset.view === v ? "true" : "false");
    });
    try { localStorage.setItem("linux-view", v); } catch (e) {}
  }
  [].forEach.call(document.querySelectorAll(".viewtabs button"), function (b) {
    b.addEventListener("click", function (e) { e.stopPropagation(); setView(b.dataset.view); });
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "v" || e.key === "V" || e.key === "м" || e.key === "М") && !e.ctrlKey && !e.metaKey) setView(view === "manual" ? "ansible" : "manual");
  });
  setView(view);

  /* --- 02: live auth.log + layers --- */
  var USERS = ["root", "admin", "ubuntu", "test", "oracle", "postgres", "user", "git", "root", "root", "deploy", "pi"];
  var IPS = ["203.0.113.45", "198.51.100.23", "192.0.2.77", "203.0.113.200", "198.51.100.91", "192.0.2.14"];
  var logT = null, cnt = 0, lines = [];
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var d = new Date(), u = USERS[Math.floor(Math.random() * USERS.length)], ip = IPS[Math.floor(Math.random() * IPS.length)];
    var port = 30000 + Math.floor(Math.random() * 30000);
    var msg = u === "root"
      ? 'Failed password for <span class="bad">root</span> from <span class="ip">' + ip + "</span> port " + port + " ssh2"
      : Math.random() < .5
        ? 'Invalid user <span class="bad">' + u + '</span> from <span class="ip">' + ip + "</span> port " + port
        : 'Failed password for invalid user <span class="bad">' + u + '</span> from <span class="ip">' + ip + "</span> port " + port + " ssh2";
    lines.push(pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " sshd: " + msg);
    if (lines.length > 40) lines.shift();
    cnt++;
    var el = $("authLog"); el.innerHTML = lines.join("\n"); el.scrollTop = el.scrollHeight;
    $("authCnt").textContent = cnt;
    logT = setTimeout(tick, 350 + Math.random() * 900);
  }
  [].forEach.call(document.querySelectorAll("[data-go]"), function (b) {
    b.addEventListener("click", function () { window.deckAPI.go(parseInt(b.dataset.go, 10) - 1); });
  });

  /* --- 03: vulnerability window --- */
  function win() {
    var d = parseInt($("winR").value, 10), p = Math.min(100, d / 60 * 100);
    $("winM").style.width = Math.max(3, p) + "%";
    $("winM").style.background = d < 3 ? "#16a34a" : d < 14 ? "#f59e0b" : "#dc2626";
    $("winTxt").textContent = d === 0 ? "обновились сегодня" : "не обновлялись " + d + " дн.";
    $("winNote").textContent = d < 3
      ? "Заплатки стоят: известные дыры закрыты."
      : d < 14
        ? "Вышли новые исправления — сервер уязвим для того, что уже описано в бюллетенях."
        : "Дыры давно опубликованы, а для части из них есть готовые эксплойты. Дверь открыта для всех.";
  }
  $("winR").addEventListener("input", win); win();

  /* --- 04: key handshake --- */
  var hs = 0, hsSteps = [].slice.call(document.querySelectorAll("#hs .hstep"));
  function hsRender() { hsSteps.forEach(function (s, i) { s.classList.toggle("on", i === hs - 1); s.classList.toggle("done", i < hs - 1); }); $("hsNext").textContent = hs >= hsSteps.length ? "Ещё раз ⟲" : "Шаг →"; }
  $("hsNext").addEventListener("click", function (e) { e.stopPropagation(); hs = hs >= hsSteps.length ? 1 : hs + 1; hsRender(); });
  $("hsReset").addEventListener("click", function (e) { e.stopPropagation(); hs = 0; hsRender(); });
  hsRender();

  /* --- 05: who gets in --- */
  var S5 = { root: false, pass: false, allow: false, port: false };
  var ACTORS = [
    { t: "🤖 Бот перебирает пароль <b>root</b>", f: function () { return S5.root ? "blocked:PermitRootLogin" : S5.pass ? "blocked:пароли выключены" : S5.allow ? "blocked:нет в AllowUsers" : "open"; } },
    { t: "🤖 Бот перебирает пароль <b>anna</b>", f: function () { return S5.pass ? "blocked:пароли выключены" : "open"; } },
    { t: "🎣 Украли пароль anna (фишинг)", f: function () { return S5.pass ? "blocked:пароль не принимают" : "open"; } },
    { t: "🗝️ Чужой ключ на аккаунте <b>root</b>", f: function () { return S5.root ? "blocked:PermitRootLogin" : S5.allow ? "blocked:нет в AllowUsers" : "open"; } },
    { t: "📡 Сканер стучится в порт 22", f: function () { return S5.port ? "noise:тише в логах, но порт найдут" : "noise:шумит в логах"; } },
    { t: "🙋 anna со своим ключом", f: function () { return "mine:✅ проходит"; } }
  ];
  function who() {
    $("who").innerHTML = ACTORS.map(function (a) {
      var r = a.f(), k = r.split(":")[0], txt = r.split(":").slice(1).join(":");
      var lab = k === "open" ? "🔓 проходит" : k === "blocked" ? "🔒 " + txt : txt;
      return '<div class="wr ' + k + '"><span>' + a.t + "</span><b>" + lab + "</b></div>";
    }).join("");
  }
  [].forEach.call(document.querySelectorAll("#sws .sw"), function (b) {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      S5[b.dataset.s] = !S5[b.dataset.s]; b.setAttribute("aria-pressed", S5[b.dataset.s] ? "true" : "false"); who();
    });
  });
  who();

  /* --- 06: ports --- */
  var PORTS = [
    { s: "sshd", a: "0.0.0.0:22", p: 22, need: true },
    { s: "nginx", a: "0.0.0.0:80", p: 80, need: true },
    { s: "nginx", a: "0.0.0.0:443", p: 443, need: true },
    { s: "postgres", a: "127.0.0.1:5432", p: 5432, local: true },
    { s: "redis", a: "0.0.0.0:6379", p: 6379 },
    { s: "cupsd", a: "0.0.0.0:631", p: 631, cups: true }
  ];
  var fw = false, cupsOff = false;
  function ports() {
    var vis = 0;
    $("ports").querySelector("tbody").innerHTML = PORTS.map(function (r) {
      var off = r.cups && cupsOff, st;
      if (off) st = '<span class="status st-no">сервис выключен</span>';
      else if (r.local) st = '<span class="status st-ok">только локально</span>';
      else if (!fw) { st = '<span class="status" style="color:#be123c;background:#fff1f2;border-color:#fecdd3">виден всем</span>'; vis++; }
      else if (r.need) { st = '<span class="status st-ok">открыт намеренно</span>'; vis++; }
      else st = '<span class="status st-ch">закрыт ufw, но слушает</span>';
      return '<tr class="' + (off ? "off" : "") + '"><td>' + r.s + "</td><td><code>" + r.a + "</code></td><td>" + st + "</td></tr>";
    }).join("");
    $("fwSum").textContent = "снаружи доступно портов: " + vis;
  }
  $("fwT").addEventListener("click", function (e) { e.stopPropagation(); fw = !fw; this.setAttribute("aria-pressed", fw); ports(); });
  $("cupsT").addEventListener("click", function (e) { e.stopPropagation(); cupsOff = !cupsOff; this.setAttribute("aria-pressed", cupsOff); ports(); });
  ports();

  /* --- 07: fail2ban --- */
  var jail = {}, fbT = [], MAX = 5;
  function now() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); }
  function fbLog(s) { var el = $("fbLog"); el.innerHTML += now() + " " + s + "\n"; el.scrollTop = el.scrollHeight; }
  function jailRender() {
    var ips = Object.keys(jail);
    $("jail").innerHTML = ips.length ? ips.map(function (ip) {
      var j = jail[ip], dots = "";
      for (var i = 0; i < MAX; i++) dots += "<i" + (i < j.f ? ' class="f"' : "") + "></i>";
      var st = j.ban ? '<span class="status" style="color:#be123c;background:#fff1f2;border-color:#fecdd3">⛔ бан на 1 ч</span>'
        : j.ok ? '<span class="status st-ok">✅ вошла по ключу</span>' : '<span class="status st-ch">👀 под наблюдением</span>';
      return "<tr><td>" + ip + (j.me ? " <small>(вы)</small>" : "") + '</td><td><span class="dots5' + (j.ban ? " banned" : "") + '">' + dots + "</span> " + j.f + "</td><td>" + st + "</td></tr>";
    }).join("") : '<tr><td colspan="3" class="muted">пока тихо</td></tr>';
  }
  function fail(ip, me) {
    var j = jail[ip] = jail[ip] || { f: 0, ban: false, me: me };
    if (j.ban) { fbLog('<span style="color:#be123c">NOTICE [sshd] ' + ip + " already banned — пакеты отбрасываются</span>"); return; }
    j.f++;
    fbLog("INFO [sshd] Found " + ip + " (" + j.f + "/" + MAX + ")");
    if (j.f >= MAX) { j.ban = true; fbLog('<b style="color:#be123c">NOTICE [sshd] Ban ' + ip + "</b>"); }
    jailRender();
  }
  function clearT() { fbT.forEach(clearTimeout); fbT = []; }
  $("fbBot").addEventListener("click", function (e) {
    e.stopPropagation();
    for (var i = 0; i < 7; i++) fbT.push(setTimeout(function () { fail("203.0.113.45", false); }, i * 380));
  });
  $("fbMe").addEventListener("click", function (e) {
    e.stopPropagation();
    fbT.push(setTimeout(function () { fail("198.51.100.7", true); }, 0));
    fbT.push(setTimeout(function () { fail("198.51.100.7", true); }, 450));
    fbT.push(setTimeout(function () { var j = jail["198.51.100.7"]; if (j && !j.ban) { j.ok = true; fbLog("INFO [sshd] 198.51.100.7: успешный вход — счётчик не превысил 5"); jailRender(); } }, 950));
  });
  $("fbHour").addEventListener("click", function (e) {
    e.stopPropagation(); clearT();
    Object.keys(jail).forEach(function (ip) { if (jail[ip].ban) fbLog('<span style="color:#0e7a43">NOTICE [sshd] Unban ' + ip + "</span>"); });
    jail = {}; jailRender();
  });
  jailRender();
  fbLog("INFO  Jail 'sshd' started");

  /* --- 08: checklist --- */
  var boxes = [].slice.call(document.querySelectorAll("#order input"));
  function ord(save) {
    var n = boxes.filter(function (b) { return b.checked; }).length;
    $("ordBar").style.width = (n / boxes.length * 100) + "%";
    if (save) try { localStorage.setItem("linux-checklist", JSON.stringify(boxes.map(function (b) { return b.checked; }))); } catch (e) {}
  }
  try { var sv = JSON.parse(localStorage.getItem("linux-checklist") || "[]"); boxes.forEach(function (b, i) { b.checked = !!sv[i]; }); } catch (e) {}
  boxes.forEach(function (b) { b.addEventListener("change", function () { ord(true); }); });
  ord(false);

  /* --- lifecycle --- */
  function onSlide() {
    clearTimeout(logT); logT = null;
    if (current === 1) { if (!lines.length) { for (var k = 0; k < 9; k++) { clearTimeout(logT); tick(); } cnt = 0; $("authCnt").textContent = 0; } else tick(); }
  }
  onSlide();
})();
