(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

  var themeToggle = document.getElementById("themeToggle");
  var storedTheme = null;
  try {
    storedTheme = localStorage.getItem("theme");
  } catch (e) { /* noop */ }

  if (storedTheme) {
    document.documentElement.setAttribute("data-theme", storedTheme);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    document.documentElement.setAttribute("data-theme", "light");
  }

  themeToggle.addEventListener("click", function () {
    var current = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", current);
    try {
      localStorage.setItem("theme", current);
    } catch (e) { /* noop */ }
  });

  var header = document.querySelector(".header");
  function onScrollHeader() {
    header.classList.toggle("header--scrolled", window.scrollY > 30);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function closeMenu() {
    burger.classList.remove("is-open");
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
  }

  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 860) {
        closeMenu();
      }
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });

  var revealTargets = document.querySelectorAll(".reveal, .reveal-group");
  var revealObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );
  revealTargets.forEach(function (el) {
    revealObs.observe(el);
  });

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = clamp((ts - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var countObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) {
      countObs.observe(el);
    });
  }

  var scrollSpyLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__link"));
  var sections = scrollSpyLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function headerHeight() {
    return header.offsetHeight;
  }

  function setActive(id) {
    scrollSpyLinks.forEach(function (link) {
      link.classList.toggle("is-active", id != null && link.getAttribute("href") === "#" + id);
    });
  }

  var lockedId = null;
  var lockTimer = null;

  function lockActive(id) {
    lockedId = id;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(function () {
      lockedId = null;
    }, 1600);
  }

  function unlockActive() {
    clearTimeout(lockTimer);
    lockedId = null;
  }

  function onScrollSpy() {
    if (lockedId) {
      setActive(lockedId);
      return;
    }
    if (!sections.length) return;
    var current = null;
    sections.forEach(function (sec) {
      var rect = sec.getBoundingClientRect();
      if (rect.top <= headerHeight() + 30) {
        current = sec;
      }
    });
    setActive(current ? current.id : null);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (window.innerWidth <= 860) {
        closeMenu();
      }
      var top = target.getBoundingClientRect().top + window.scrollY - headerHeight() + 20;
      lockActive(id.slice(1));
      window.scrollTo({ top: Math.max(top, 0), behavior: prefersReducedMotion ? "auto" : "smooth" });
      try {
        history.replaceState(null, "", id);
      } catch (err) {}
      setActive(id.slice(1));
    });
  });

  onScrollSpy();
  window.addEventListener("scroll", onScrollSpy, { passive: true });
  window.addEventListener("resize", onScrollSpy);
  window.addEventListener("load", onScrollSpy);
  var spyDebounce;
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(spyDebounce);
      spyDebounce = setTimeout(onScrollSpy, 150);
    },
    { passive: true }
  );
  if ("onscrollend" in window) {
    window.addEventListener("scrollend", function () {
      unlockActive();
      onScrollSpy();
    });
  }

  var tiltCards = document.querySelectorAll("[data-tilt]");
  if (tiltCards.length && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    tiltCards.forEach(function (card) {
      var rect = card.getBoundingClientRect();
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = "transform 0.12s ease-out";
        card.style.transform = "perspective(900px) rotateX(" + (-py * 7) + "deg) rotateY(" + px * 9 + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      });
      card.addEventListener("mouseenter", function () {
        rect = card.getBoundingClientRect();
      });
    });
  }

  var magneticEls = document.querySelectorAll("[data-magnetic]");
  if (magneticEls.length && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    magneticEls.forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = "translate(" + x + "px, " + y + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transition = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "translate(0, 0)";
      });
      el.addEventListener("mouseenter", function () {
        el.style.transition = "transform 0.2s ease-out";
      });
    });
  }

  var cursorDot = document.querySelector(".cursor__dot");
  var cursorRing = document.querySelector(".cursor__ring");
  var cursor = document.querySelector(".cursor");

  var cursorX = -100;
  var cursorY = -100;
  var ringX = -100;
  var ringY = -100;

  if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
    document.documentElement.classList.add("cursor-on");

    document.addEventListener("mousemove", function (e) {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    cursorX = window.innerWidth / 2;
    cursorY = window.innerHeight / 2;
    ringX = cursorX;
    ringY = cursorY;

    function cursorRaf() {
      ringX += (cursorX - ringX) * 0.18;
      ringY += (cursorY - ringY) * 0.18;
      cursorDot.style.left = cursorX + "px";
      cursorDot.style.top = cursorY + "px";
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";
      requestAnimationFrame(cursorRaf);
    }
    requestAnimationFrame(cursorRaf);

    document.addEventListener("mouseover", function (e) {
      if (e.target.closest("a, button, input, textarea, [data-tilt], [data-expand]")) {
        cursor.classList.add("cursor--active");
      }
    });

    document.addEventListener("mouseout", function (e) {
      if (e.target.closest("a, button, input, textarea, [data-tilt], [data-expand]")) {
        cursor.classList.remove("cursor--active");
      }
    });
  }

  var expandTargets = document.querySelectorAll("[data-expand]");
  var expander = document.getElementById("textExpander");

  if (expandTargets.length && expander) {
    var lastFocus = null;

    function openExpander() {
      lastFocus = document.activeElement;
      expander.classList.add("is-open");
      expander.setAttribute("aria-hidden", "false");
      expandTargets.forEach(function (el) {
        el.setAttribute("aria-expanded", "true");
      });
      document.body.classList.add("no-scroll");
      var closeBtn = expander.querySelector(".expander__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeExpander() {
      expander.classList.remove("is-open");
      expander.setAttribute("aria-hidden", "true");
      expandTargets.forEach(function (el) {
        el.setAttribute("aria-expanded", "false");
      });
      document.body.classList.remove("no-scroll");
      if (lastFocus) lastFocus.focus();
    }

    expandTargets.forEach(function (target) {
      target.addEventListener("click", openExpander);
      target.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openExpander();
        }
      });
    });

    expander.querySelectorAll("[data-expander-close]").forEach(function (el) {
      el.addEventListener("click", closeExpander);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && expander.classList.contains("is-open")) {
        closeExpander();
      }
    });
  }

  var consentModal = document.getElementById("consentModal");
  if (consentModal) {
    var consentOpens = document.querySelectorAll("[data-consent-open]");
    var consentLastFocus = null;

    function openConsent() {
      consentLastFocus = document.activeElement;
      consentModal.classList.add("is-open");
      consentModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      var closeBtn = consentModal.querySelector(".expander__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeConsent() {
      consentModal.classList.remove("is-open");
      consentModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      if (consentLastFocus) consentLastFocus.focus();
    }

    consentOpens.forEach(function (el) {
      el.addEventListener("click", openConsent);
    });

    consentModal.querySelectorAll("[data-consent-close]").forEach(function (el) {
      el.addEventListener("click", closeConsent);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && consentModal.classList.contains("is-open")) {
        closeConsent();
      }
    });
  }

  var serviceModalEls = Array.prototype.slice.call(document.querySelectorAll("[data-service-open]"));
  if (serviceModalEls.length) {
    var serviceFocus = null;

    function openServiceModal(id, trigger) {
      var m = document.getElementById(id);
      if (!m) return;
      serviceFocus = trigger;
      m.classList.add("is-open");
      m.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      var closeBtn = m.querySelector(".expander__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeServiceModal(m) {
      m.classList.remove("is-open");
      m.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      if (serviceFocus) serviceFocus.focus();
    }

    serviceModalEls.forEach(function (trigger) {
      var id = trigger.getAttribute("data-service-open");
      var modal = document.getElementById(id);
      if (!modal) return;
      trigger.addEventListener("click", function () {
        openServiceModal(id, trigger);
      });
      modal.querySelectorAll("[data-service-close]").forEach(function (el) {
        el.addEventListener("click", function () {
          closeServiceModal(modal);
        });
      });
    });

    document.querySelectorAll(".expander[id^='serviceModal'] a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function () {
        closeServiceModal(a.closest(".expander"));
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var openModal = document.querySelector(".expander.is-open[id^='serviceModal']");
      if (openModal) closeServiceModal(openModal);
    });
  }

  var processToggles = Array.prototype.slice.call(document.querySelectorAll(".process__list .solution-item__toggle"));
  processToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".solution-item");
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) {
        panel.setAttribute("aria-hidden", open ? "false" : "true");
        if (open && !prefersReducedMotion) {
          panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    });
  });

  var calcData = {
    landing: {
      label: "Лендинг",
      base: [
        { t: "Сайт-визитка (1 экран)", p: 5000, d: 2 },
        { t: "Одностраничник под ключ", p: 8000, d: 3 },
        { t: "Продающий лендинг + тексты", p: 12000, d: 5 },
        { t: "Лендинг с анимациями и эффектами", p: 18000, d: 7 }
      ],
      options: [
        { t: "Базовый калькулятор", p: 3000, d: 1 },
        { t: "Продвинутый калькулятор + 3D-визуализация", p: 15000, d: 3 },
        { t: "SEO-текст для страницы", p: 3000, d: 1 },
        { t: "GEO-текст под локальный поиск", p: 3000, d: 1 }
      ]
    },
    bot: {
      label: "Чат-бот",
      base: [
        { t: "Бот со сценариями и FAQ (без ИИ)", p: 8000, d: 4 },
        { t: "Бот с ИИ через ProxyAPI", p: 15000, d: 6 },
        { t: "Бот с ИИ + аналитика и передача оператору", p: 20000, d: 9 }
      ],
      options: [
        { t: "Интеграция с базой знаний", p: 5000, d: 2 },
        { t: "Аналитика диалогов", p: 3000, d: 1 },
        { t: "Поддержка в течение месяца", p: 3000, d: 0 }
      ]
    },
    calc: {
      label: "Калькулятор",
      base: [
        { t: "Базовый: цены, наценки, скидки", p: 5000, d: 3 },
        { t: "Продвинутый: габариты, смета, оборудование", p: 12000, d: 5 },
        { t: "Продвинутый + 3D-визуализация", p: 20000, d: 8 }
      ],
      options: [
        { t: "Автообновление из прайс-таблицы", p: 4000, d: 1 },
        { t: "Валидация и защита ввода", p: 1500, d: 0 },
        { t: "Поддержка и обновления ежемесячно", p: 2000, d: 0 }
      ]
    },
    mvp: {
      label: "MVP",
      base: [
        { t: "MVP-лендинг", p: 10000, d: 4 },
        { t: "MVP-бот", p: 15000, d: 6 },
        { t: "MVP-сервис / инструмент", p: 20000, d: 9 }
      ],
      options: [
        { t: "Демо на тестовом хостинге", p: 1500, d: 1 },
        { t: "Блок правок после демо", p: 2000, d: 1 },
        { t: "Документ с требованиями", p: 1000, d: 0 }
      ]
    }
  };

  var calcServiceEls = document.querySelectorAll("[data-calc-service]");
  var calcBaseEl = document.getElementById("calcBase");
  var calcOptionsEl = document.getElementById("calcOptions");
  var calcPriceEl = document.getElementById("calcPrice");
  var calcTimeEl = document.getElementById("calcTime");
  var calcSubmitEl = document.getElementById("calcSubmit");

  if (calcServiceEls.length && calcBaseEl && calcOptionsEl) {
    var calcService = "landing";
    var calcBaseIndex = 1;
    var calcChecked = {};
    var lastCalcSummary = null;

    function fmt(n) {
      return n.toLocaleString("ru-RU");
    }

    function pluralDays(n) {
      if (n % 10 === 1 && n % 100 !== 11) return n + " день";
      if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) return n + " дня";
      return n + " дней";
    }

    function renderCalc() {
      var data = calcData[calcService];
      calcBaseEl.innerHTML = "";
      data.base.forEach(function (item, i) {
        var label = document.createElement("label");
        label.className = "calc-radio" + (i === calcBaseIndex ? " is-active" : "");
        label.innerHTML =
          '<span class="calc-radio__dot"></span>' +
          '<span class="calc-radio__name"></span>' +
          '<span class="calc-radio__meta"><span class="calc-radio__price"></span><i></i></span>';
        label.querySelector(".calc-radio__name").textContent = item.t;
        label.querySelector(".calc-radio__price").textContent = "от " + fmt(item.p) + " ₽";
        label.querySelector("i").textContent = pluralDays(item.d);
        label.addEventListener("click", function () {
          calcBaseIndex = i;
          renderCalc();
        });
        calcBaseEl.appendChild(label);
      });

      calcOptionsEl.innerHTML = "";
      data.options.forEach(function (item, i) {
        var label = document.createElement("label");
        label.className = "calc-check";
        label.innerHTML =
          '<input type="checkbox" data-option-index="' + i + '"' + (calcChecked[calcService + "-" + i] ? " checked" : "") + ">" +
          '<span class="calc-check__box"></span>' +
          '<span class="calc-check__body"><span class="calc-check__name"></span><span class="calc-check__price">+ от <b></b> ₽ <span class="calc-check__days"></span></span></span>';
        label.querySelector(".calc-check__name").textContent = item.t;
        label.querySelector("b").textContent = fmt(item.p);
        label.querySelector(".calc-check__days").textContent = item.d ? ", " + pluralDays(item.d) : "";
        label.querySelector("input").addEventListener("change", function () {
          calcChecked[calcService + "-" + i] = this.checked;
          updateCalcResult();
        });
        calcOptionsEl.appendChild(label);
      });

      updateCalcResult();
    }

    function updateCalcResult() {
      var data = calcData[calcService];
      var base = data.base[calcBaseIndex];
      var total = base.p;
      var daysPlus = 0;
      data.options.forEach(function (item, i) {
        if (calcChecked[calcService + "-" + i]) {
          total += item.p;
          daysPlus += item.d;
        }
      });
      var dMin = base.d;
      var dMax = base.d + daysPlus;
      calcPriceEl.textContent = fmt(total);
      if (dMax === dMin) {
        calcTimeEl.textContent = "Срок: " + pluralDays(dMin);
      } else {
        calcTimeEl.textContent = "Срок: " + dMin + "–" + dMax + " дн.";
      }
      syncCalcSummary();
    }

    function buildCalcSummary() {
      var data = calcData[calcService];
      var base = data.base[calcBaseIndex];
      var total = base.p;
      var daysPlus = 0;
      var parts = [];
      data.options.forEach(function (item, i) {
        if (calcChecked[calcService + "-" + i]) {
          total += item.p;
          daysPlus += item.d;
          parts.push(item.t);
        }
      });
      var dMin = base.d;
      var dMax = base.d + daysPlus;
      var range = dMax === dMin ? pluralDays(dMin) : dMin + "–" + dMax + " дн.";
      return (
        "Задача: " + data.label + " — " + base.t + ".\n" +
        "Дополнительно: " + (parts.join(", ") || "—") + ".\n" +
        "Расчёт с калькулятора: от " + fmt(base.p) + " ₽.\n" +
        "Итого с выбранными опциями: " + fmt(total) + " ₽ · Срок: " + range + "."
      );
    }

    function syncCalcSummary() {
      var form = document.getElementById("contactForm");
      if (!form) return;
      var msg = form.querySelector('textarea[name="message"]');
      if (!msg) return;
      if (msg.value !== lastCalcSummary) return;
      var next = buildCalcSummary();
      if (next !== lastCalcSummary) {
        msg.value = next;
        lastCalcSummary = next;
      }
    }

    function selectCalcService(key, focusCalc) {
      if (!calcData[key]) return;
      calcService = key;
      calcChecked = {};
      calcBaseIndex = 1;
      calcServiceEls.forEach(function (el) {
        el.classList.toggle("is-active", el.getAttribute("data-calc-service") === key);
      });
      renderCalc();
      if (focusCalc) {
        var sec = document.getElementById("calc");
        if (sec) sec.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      }
    }

    calcServiceEls.forEach(function (el) {
      el.addEventListener("click", function () {
        selectCalcService(el.getAttribute("data-calc-service"));
      });
    });

    document.querySelectorAll("[data-calc-open]").forEach(function (el) {
      el.addEventListener("click", function () {
        selectCalcService(el.getAttribute("data-calc-open"), true);
      });
    });

    if (calcSubmitEl) {
      calcSubmitEl.addEventListener("click", function () {
        var form = document.getElementById("contactForm");
        if (!form) return;
        var msg = form.querySelector('textarea[name="message"]');
        if (!msg) return;
        msg.value = buildCalcSummary();
        lastCalcSummary = msg.value;
      });
    }

    renderCalc();
  }

  var orbs = Array.prototype.slice.call(document.querySelectorAll(".orb"));
  var orbBase = orbs.map(function (orb) {
    return { el: orb, depth: parseFloat(orb.getAttribute("data-depth")) || 0.3 };
  });

  var mouseX = 0;
  var mouseY = 0;
  var targetX = 0;
  var targetY = 0;
  var smoothX = 0;
  var smoothY = 0;

  window.addEventListener("mousemove", function (e) {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  var scrollElements = Array.prototype.slice.call(document.querySelectorAll("[data-parallax-scroll]"));
  var scrollData = scrollElements.map(function (el) {
    return { el: el, speed: parseFloat(el.getAttribute("data-parallax-scroll")) || 0.1 };
  });

  var floatCards = Array.prototype.slice.call(document.querySelectorAll(".hero__card-float"));
  var floatData = floatCards.map(function (card) {
    return { el: card, depth: parseFloat(card.getAttribute("data-depth")) || 0.35 };
  });

  var scrollY = 0;

  function rafLoop() {
    smoothX += (targetX - smoothX) * 0.08;
    smoothY += (targetY - smoothY) * 0.08;

    orbBase.forEach(function (item) {
      item.el.style.translate = smoothX * 36 * item.depth + "px " + smoothY * 36 * item.depth + "px";
    });

    floatData.forEach(function (item) {
      var tx = smoothX * 22 * item.depth;
      var ty = smoothY * 18 * item.depth;
      item.el.style.setProperty("--fx", tx + "px");
      item.el.style.setProperty("--fy", ty + "px");
    });

    scrollData.forEach(function (item) {
      var y = scrollY * item.speed;
      item.el.style.translate = "0px " + y + "px";
    });

    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  window.addEventListener(
    "scroll",
    function () {
      scrollY = window.scrollY;
    },
    { passive: true }
  );

  var floatCardsStyle = document.createElement("style");
  floatCardsStyle.textContent = ".hero__card-float { translate: var(--fx,0px) var(--fy,0px); }";
  document.head.appendChild(floatCardsStyle);

  var terminalBody = document.getElementById("terminalBody");
  var terminalType = document.getElementById("terminalType");
  if (terminalBody) {
    var lines = [
      { prompt: "$", text: "vibe --init landing-calculator", dim: true },
      { prompt: "▸", text: "генерирую каркас + семантику… 100%", dim: false },
      { prompt: "▸", text: "пишу логику калькулятора под нишу", dim: false },
      { prompt: "▸", text: "тест: мобильные, скорость, UX", dim: false },
      { prompt: "$", text: "вы проверяете MVP на хостинге", dim: true },
      { prompt: "▸", text: "правки по фидбеку… готово ✦", dim: false },
      { prompt: "✓", text: "запуск за 3 дня", dim: false, ok: true }
    ];

    var typeTick = { prompt: "$", text: "", cursor: true, dim: false };
    lines.push(typeTick);

    var index = 0;
    var charIndex = 0;
    var started = false;
    var termObs = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && !started) {
          started = true;
          requestAnimationFrame(stepLine);
          termObs.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    termObs.observe(terminalBody);

    function stepLine() {
      var line = lines[index];
      if (!line) {
        return;
      }

      if (line.cursor) {
        drawCursorLine();
        terminalType.textContent = "idle — ждём вашу задачу";
        return;
      }

      var textNode = line.text;
      var el = document.createElement("div");
      el.className = "term-line";
      var promptEl = document.createElement("span");
      promptEl.className = "term-line__prompt";
      promptEl.textContent = line.prompt;
      var textEl = document.createElement("span");
      textEl.className = "term-line__text" + (line.ok ? " glow-ok" : "") + (line.dim ? " dim" : "");
      el.appendChild(promptEl);
      el.appendChild(textEl);
      terminalBody.appendChild(el);

      charIndex = 0;
      var timer = setInterval(function () {
        charIndex++;
        textEl.textContent = textNode.slice(0, charIndex);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        if (charIndex >= textNode.length) {
          clearInterval(timer);
          index++;
          setTimeout(stepLine, line.ok ? 200 : 320);
        }
      }, 16);
    }

    function drawCursorLine() {
      var el = document.createElement("div");
      el.className = "term-line";
      var promptEl = document.createElement("span");
      promptEl.className = "term-line__prompt";
      promptEl.textContent = "$";
      var textEl = document.createElement("span");
      textEl.className = "term-line__text dim";
      textEl.textContent = "Готов. ";
      var cursorEl = document.createElement("span");
      cursorEl.className = "term-line__cursor";
      textEl.appendChild(cursorEl);
      el.appendChild(promptEl);
      el.appendChild(textEl);
      terminalBody.appendChild(el);
    }
  }

  var form = document.getElementById("contactForm");
  if (form) {
    var successBox = document.getElementById("formSuccess");
    var errorBox = document.getElementById("formError");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        input.classList.toggle("form__input--error", !input.value.trim());
        if (!input.value.trim()) {
          valid = false;
          input.focus();
        }
      });
      if (!valid) return;

      var btn = form.querySelector(".form__submit");
      var label = btn.querySelector(".btn__label");
      var original = label.textContent;
      label.textContent = "Отправляю…";
      btn.disabled = true;

      var payload = {};
      form.querySelectorAll("[name]").forEach(function (input) {
        payload[input.name] = input.value;
      });
      payload._captcha = "false";
      payload._subject = "Заявка с сайта: " + (payload.name || "посетитель");

      fetch("https://formsubmit.co/ajax/DmmShiryev@yandex.ru", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function () {
          btn.disabled = false;
          label.textContent = original;
          form.reset();
          errorBox.classList.remove("is-visible");
          successBox.classList.add("is-visible");
          setTimeout(function () {
            successBox.classList.remove("is-visible");
          }, 6000);
        })
        .catch(function () {
          btn.disabled = false;
          label.textContent = original;
          successBox.classList.remove("is-visible");
          errorBox.classList.add("is-visible");
          setTimeout(function () {
            errorBox.classList.remove("is-visible");
          }, 6000);
        });
    });

    form.querySelectorAll(".form__input").forEach(function (input) {
      input.addEventListener("input", function () {
        input.classList.remove("form__input--error");
      });
    });
  }

  var formErrorStyle = document.createElement("style");
  formErrorStyle.textContent =
    ".form__input--error { border-color: var(--danger) !important; box-shadow: 0 0 0 4px rgba(251,113,133,0.15) !important; }";
  document.head.appendChild(formErrorStyle);
})();