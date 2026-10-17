/* Slide-specific interactivity */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* --- 05: light switches --- */
  var a = false, b = false;
  $("tglA").onclick = function () { a = !a; $("bulbA").classList.toggle("on", a); };
  $("tglB").onclick = function () { b = true; $("bulbB").classList.add("on"); };

  /* --- 05: shell vs lineinfile --- */
  var BASE = ["# DNS-серверы", "nameserver 8.8.8.8"], LINE = "nameserver 1.1.1.1";
  var fa, fb, runs;
  function show(el, lines, mark) {
    el.innerHTML = lines.map(function (l, i) {
      var c = mark && mark[i] ? ' class="' + mark[i] + '"' : "";
      return "<span" + c + ">" + esc(l) + "</span>";
    }).join("\n");
  }
  function setSt(el, kind, txt) { el.className = "status " + kind; el.textContent = txt; }
  function resetIdem() {
    fa = BASE.slice(); fb = BASE.slice(); runs = 0;
    show($("fileA"), fa); show($("fileB"), fb);
    setSt($("stA"), "st-no", "ещё не запускали"); setSt($("stB"), "st-no", "ещё не запускали");
    $("runsIdem").textContent = "Запусков: 0";
  }
  $("runIdem").onclick = function () {
    runs++;
    fa.push(LINE);
    var markA = fa.map(function (l, i) {
      if (l !== LINE) return "";
      if (i === fa.length - 1) return fa.indexOf(LINE) === i ? "new" : "dup new";
      return fa.indexOf(LINE) === i ? "" : "dup";
    });
    show($("fileA"), fa, markA);
    setSt($("stA"), "st-ch", "changed" + (runs > 1 ? " · дублей: " + (runs - 1) : ""));
    var added = fb.indexOf(LINE) < 0;
    if (added) fb.push(LINE);
    show($("fileB"), fb, fb.map(function (l, i) { return added && i === fb.length - 1 ? "new" : ""; }));
    setSt($("stB"), added ? "st-ch" : "st-ok", added ? "changed" : "ok · уже так");
    $("runsIdem").textContent = "Запусков: " + runs + (runs > 1 ? " — справа ничего не меняется" : "");
  };
  $("resetIdem").onclick = resetIdem;
  resetIdem();

  /* --- 06: module catalog --- */
  var CAT = {
    pkg: ["Пакеты", "packages.yml", '- name: Нужные пакеты установлены\n  ansible.builtin.apt:\n    name: [nginx, git]\n    state: present', "Модуль сам решит, что ставить: уже установленные пакеты он пропустит."],
    files: ["Файлы", "files.yml", '- name: Каталог для приложения\n  ansible.builtin.file:\n    path: /opt/shop\n    state: directory\n    owner: deploy\n    mode: "0755"', "Описываем, каким должен быть файл или каталог: владелец, права, содержимое."],
    svc: ["Сервисы", "services.yml", '- name: Бэкап каждую ночь\n  ansible.builtin.cron:\n    name: nightly backup\n    hour: "3"\n    minute: "0"\n    job: /opt/backup.sh', "Задача в cron с именем: повторный запуск не создаст дубль."],
    users: ["Доступы", "users.yml", '- name: Пользователь существует\n  ansible.builtin.user:\n    name: anna\n    groups: devs\n    state: present', "state: absent удалит пользователя. Переключатель «есть/нет» — одна строка."],
    net: ["Сеть и защита", "firewall.yml", '- name: Открыть HTTPS\n  ansible.posix.firewalld:\n    service: https\n    permanent: true\n    state: enabled', "Для RHEL-семейства — firewalld, для Ubuntu — ufw. Подход тот же."],
    db: ["Базы данных", "db.yml", '- name: База существует\n  community.postgresql.postgresql_db:\n    name: shop\n    state: present', "Подробно разберём на примере PostgreSQL через пару слайдов."],
    ctr: ["Контейнеры", "docker.yml", '- name: Redis запущен\n  community.docker.docker_container:\n    name: cache\n    image: redis:7\n    state: started', "Контейнеры тоже описываются состоянием: «должен работать»."],
    cloud: ["Облака", "cloud.yml", '- name: Виртуальная машина в AWS\n  amazon.aws.ec2_instance:\n    name: web-01\n    instance_type: t3.micro\n    image_id: ami-0abcdef1234567890\n    state: running', "Ansible умеет не только настраивать серверы, но и создавать их."]
  };
  var catBtns = [].slice.call(document.querySelectorAll("#cats .cat"));
  function pickCat(k) {
    var c = CAT[k];
    catBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.c === k ? "true" : "false"); });
    var host = $("catCode");
    var btn = catBtns.filter(function (b) { return b.dataset.c === k; })[0];
    host.className = "col " + ((btn.className.match(/dom-\w+/) || [""])[0]);
    host.innerHTML = '<script type="text/x-code" data-lang="yaml" data-title="' + c[1] + '" data-cls="grow"><\/script><div class="callout small"></div>';
    host.firstChild.textContent = c[2];
    host.lastChild.textContent = c[3];
    window.deckRenderCode && window.deckRenderCode(host.firstChild);
  }
  catBtns.forEach(function (b) { b.onclick = function () { pickCat(b.dataset.c); }; });
  pickCat("pkg");

  /* --- 12: roles house --- */
  var ROLES = {
    web: [["common", "users", "firewall", "nginx", "docker"], "web-серверы собраны из 5 ролей. common, users и firewall — те же, что и у базы."],
    db: [["common", "users", "firewall", "postgresql"], "db-серверы используют 4 роли. Первые три общие с веб-серверами: написаны один раз."],
    all: [null, "Все роли проекта. Каждая — готовый блок, который можно взять в другой проект."]
  };
  var segs = [].slice.call(document.querySelectorAll(".seg button"));
  function pickRole(h) {
    var set = ROLES[h][0];
    segs.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.h === h ? "true" : "false"); });
    [].forEach.call(document.querySelectorAll("#rhouse .rb"), function (el) {
      var inSet = !set || set.indexOf(el.dataset.r) >= 0;
      el.classList.toggle("off", !inSet); el.classList.toggle("on", !!set && inSet);
    });
    $("rnote").textContent = ROLES[h][1];
  }
  segs.forEach(function (b) { b.onclick = function () { pickRole(b.dataset.h); }; });
  pickRole("web");

  /* --- 14: server on fire --- */
  var MAN = ["вспомнить, что там стояло", "найти старые заметки", "ставить пакеты руками", "настраивать конфиги", "«а порт открыли?»", "чинить забытое"];
  var IAC = ["git clone", "ansible-playbook site.yml", "✅ готово"];
  var timers = [];
  function resetFire() {
    timers.forEach(clearTimeout); timers = [];
    ["barA", "barB"].forEach(function (id) { $(id).style.transition = "none"; $(id).style.width = "0"; });
    $("stepsA").innerHTML = ""; $("stepsB").innerHTML = ""; $("tmA").textContent = "—"; $("tmB").textContent = "—";
  }
  function run(list, stepsEl, barEl, tmEl, total, label, finalLabel) {
    barEl.style.transition = "width " + total + "ms linear";
    requestAnimationFrame(function () { requestAnimationFrame(function () { barEl.style.width = "100%"; }); });
    list.forEach(function (t, i) {
      timers.push(setTimeout(function () {
        var s = document.createElement("span"); s.textContent = t; stepsEl.appendChild(s);
        tmEl.textContent = label(i);
      }, (total / list.length) * i));
    });
    timers.push(setTimeout(function () { tmEl.textContent = finalLabel; }, total));
  }
  $("fireB").onclick = function () {
    resetFire();
    run(MAN, $("stepsA"), $("barA"), $("tmA"), 4800, function (i) { return "≈ " + (4 * (i + 1)) + " ч…"; }, "≈ 2 дня и что-то забыли");
    run(IAC, $("stepsB"), $("barB"), $("tmB"), 900, function (i) { return "≈ " + (5 * (i + 1)) + " мин"; }, "≈ 15 минут, как было");
  };
  $("fireR").onclick = resetFire;

  /* --- 15: flip cards --- */
  [].forEach.call(document.querySelectorAll(".flip"), function (f) {
    f.onclick = function () { f.setAttribute("aria-expanded", f.getAttribute("aria-expanded") === "true" ? "false" : "true"); };
  });
})();
