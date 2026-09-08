/* =========================================================
   CHO FC — Lógica de la landing (nav, scroll, calculadora y retos)
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     0. Utilidades
     --------------------------------------------------------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  /* ---------------------------------------------------------
     1. Navegación (menú móvil + scroll-spy + reloj del partido)
     --------------------------------------------------------- */
  const navToggle = $("#navToggle");
  const siteNav = $("#siteNav");

  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  const sections = $$("main section[id]");
  const navLinks = $$(".site-nav a");
  const matchClockFill = $("#matchClockFill");

  function onScroll() {
    const scrollY = window.scrollY + 100;

    let current = sections[0] && sections[0].id;
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop) current = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === current);
    });

    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - doc.clientHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    matchClockFill.style.width = Math.min(100, Math.max(0, pct)) + "%";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     2. Marcador (puntos y retos completados) — persistido
     --------------------------------------------------------- */
  const SCORE_KEY = "choFcScore";

  function loadScore() {
    try {
      const raw = JSON.parse(localStorage.getItem(SCORE_KEY));
      if (raw && typeof raw === "object") return raw;
    } catch (e) {}
    return { points: 0, reto1: false, reto2: false, reto3: false, retoFinal: false };
  }

  let score = loadScore();

  function saveScore() {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(score));
    } catch (e) {}
    renderScore();
  }

  function completedCount() {
    return ["reto1", "reto2", "reto3", "retoFinal"].filter((k) => score[k]).length;
  }

  function renderScore() {
    const points = String(score.points);
    const count = String(completedCount());
    ["scorePoints", "finalScorePoints"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = points;
    });
    ["scoreChallenges", "finalScoreChallenges"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    });
  }

  function addPoints(amount, challengeKey) {
    score.points += amount;
    if (challengeKey && !score[challengeKey]) score[challengeKey] = true;
    saveScore();
  }

  $("#restartAll").addEventListener("click", () => {
    score = { points: 0, reto1: false, reto2: false, reto3: false, retoFinal: false };
    saveScore();
    resetReto1();
    initLabelQuiz();
    initPenalty();
    clearMeal();
  });

  renderScore();

  /* ---------------------------------------------------------
     3. Base de datos de alimentos (valores aproximados, por 100 g)
     --------------------------------------------------------- */
  const CATEGORIES = [
    { id: "todos", label: "Todos" },
    { id: "fruta", label: "Frutas" },
    { id: "verdura", label: "Verduras" },
    { id: "cereal", label: "Cereales y panes" },
    { id: "tuberculo", label: "Tubérculos" },
    { id: "legumbre", label: "Legumbres" },
    { id: "lacteo", label: "Lácteos" },
    { id: "snack", label: "Snacks y dulces" },
    { id: "bebida", label: "Bebidas" },
    { id: "proteina", label: "Proteínas y grasas" },
  ];

  const ICONS = {
    fruta: '<svg viewBox="0 0 48 48"><circle cx="24" cy="26" r="16" fill="#e6483b"/><path d="M24 10c2-4 6-5 8-3-1 4-5 5-8 3z" fill="#3a8f3f"/></svg>',
    verdura: '<svg viewBox="0 0 48 48"><path d="M14 30c0-10 6-18 16-18-2 8 2 12 8 12-2 10-10 16-18 16-4 0-6-4-6-10z" fill="#3a8f3f"/></svg>',
    cereal: '<svg viewBox="0 0 48 48"><rect x="10" y="18" width="28" height="16" rx="4" fill="#e0a758"/><path d="M10 22h28" stroke="#a5722f" stroke-width="2"/></svg>',
    tuberculo: '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="26" rx="16" ry="12" fill="#c9975a"/><circle cx="18" cy="22" r="1.6" fill="#8a5a20"/><circle cx="28" cy="30" r="1.6" fill="#8a5a20"/><circle cx="30" cy="20" r="1.6" fill="#8a5a20"/></svg>',
    legumbre: '<svg viewBox="0 0 48 48"><path d="M10 24c0-8 6-14 14-14s14 6 14 14-6 14-14 14-14-6-14-14z" fill="#a3742f" opacity=".2"/><circle cx="16" cy="24" r="5" fill="#8a5a20"/><circle cx="24" cy="24" r="5" fill="#a3742f"/><circle cx="32" cy="24" r="5" fill="#8a5a20"/></svg>',
    lacteo: '<svg viewBox="0 0 48 48"><path d="M18 8h12v6l4 6v20a2 2 0 01-2 2H16a2 2 0 01-2-2V20l4-6z" fill="#ffffff" stroke="#cfd8dc" stroke-width="2"/></svg>',
    snack: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16" fill="#8a5a3a"/><circle cx="18" cy="18" r="2" fill="#5c3a20"/><circle cx="28" cy="16" r="2" fill="#5c3a20"/><circle cx="30" cy="28" r="2" fill="#5c3a20"/><circle cx="18" cy="30" r="2" fill="#5c3a20"/></svg>',
    bebida: '<svg viewBox="0 0 48 48"><path d="M16 8h16l-2 8-2 24H20l-2-24z" fill="#8fd3ff" stroke="#2a7ab5" stroke-width="2"/></svg>',
    proteina: '<svg viewBox="0 0 48 48"><ellipse cx="24" cy="24" rx="15" ry="11" fill="#e39a7a"/><ellipse cx="24" cy="24" rx="15" ry="11" fill="none" stroke="#b5674a" stroke-width="2"/></svg>',
  };

  // ---- Nivel de CHO del PLATO COMPLETO (suma total, en gramos) ----
  // AJUSTA AQUÍ los cortes cuando lo necesites:
  // "low"    -> tarjeta verde   (0 g hasta MEAL_LEVEL_THRESHOLDS.low)
  // "medium" -> tarjeta amarilla (desde low+1 hasta MEAL_LEVEL_THRESHOLDS.medium)
  // "high"   -> tarjeta roja    (más de MEAL_LEVEL_THRESHOLDS.medium)
  const MEAL_LEVEL_THRESHOLDS = {
    low: 45,
    medium: 90,
  };

  const MEAL_LEVEL_LABELS = { low: "Nivel bajo", medium: "Nivel medio", high: "Nivel alto" };

  function getMealLevel(totalChoGrams) {
    if (totalChoGrams <= MEAL_LEVEL_THRESHOLDS.low) return "low";
    if (totalChoGrams <= MEAL_LEVEL_THRESHOLDS.medium) return "medium";
    return "high";
  }

  const FOOD_DB = [
    // Frutas
    { name: "Manzana", category: "fruta", cho: 14 },
    { name: "Banano / plátano", category: "fruta", cho: 23 },
    { name: "Naranja", category: "fruta", cho: 12 },
    { name: "Mandarina", category: "fruta", cho: 13 },
    { name: "Fresa", category: "fruta", cho: 8 },
    { name: "Uvas", category: "fruta", cho: 17 },
    { name: "Sandía", category: "fruta", cho: 8 },
    { name: "Melón", category: "fruta", cho: 8 },
    { name: "Papaya", category: "fruta", cho: 10 },
    { name: "Mango", category: "fruta", cho: 15 },
    { name: "Piña", category: "fruta", cho: 13 },
    { name: "Pera", category: "fruta", cho: 15 },
    { name: "Kiwi", category: "fruta", cho: 15 },
    { name: "Durazno", category: "fruta", cho: 10 },
    { name: "Ciruela", category: "fruta", cho: 11 },
    { name: "Ciruela pasa (deshidratada)", category: "fruta", cho: 64 },
    { name: "Guayaba", category: "fruta", cho: 14 },
    { name: "Maracuyá", category: "fruta", cho: 23 },
    { name: "Higo", category: "fruta", cho: 19 },
    { name: "Aguacate", category: "fruta", cho: 9 },

    // Verduras
    { name: "Zanahoria", category: "verdura", cho: 10 },
    { name: "Tomate", category: "verdura", cho: 4 },
    { name: "Lechuga", category: "verdura", cho: 3 },
    { name: "Pepino", category: "verdura", cho: 4 },
    { name: "Brócoli", category: "verdura", cho: 7 },
    { name: "Espinaca", category: "verdura", cho: 4 },
    { name: "Pimentón", category: "verdura", cho: 6 },
    { name: "Cebolla", category: "verdura", cho: 9 },
    { name: "Calabacín", category: "verdura", cho: 3 },
    { name: "Coliflor", category: "verdura", cho: 5 },
    { name: "Arveja verde", category: "verdura", cho: 14 },
    { name: "Maíz / elote", category: "verdura", cho: 19 },
    { name: "Remolacha", category: "verdura", cho: 10 },
    { name: "Habichuela / ejote", category: "verdura", cho: 7 },
    { name: "Rábano", category: "verdura", cho: 3 },
    { name: "Apio", category: "verdura", cho: 3 },
    { name: "Berenjena", category: "verdura", cho: 6 },

    // Cereales y panes
    { name: "Arroz blanco cocido", category: "cereal", cho: 28 },
    { name: "Arroz integral cocido", category: "cereal", cho: 23 },
    { name: "Pan blanco", category: "cereal", cho: 49 },
    { name: "Pan integral", category: "cereal", cho: 41 },
    { name: "Pan de hamburguesa", category: "cereal", cho: 47 },
    { name: "Pan pita", category: "cereal", cho: 55 },
    { name: "Avena cruda", category: "cereal", cho: 66 },
    { name: "Pasta cocida", category: "cereal", cho: 25 },
    { name: "Tortilla de maíz", category: "cereal", cho: 44 },
    { name: "Tortilla de trigo", category: "cereal", cho: 50 },
    { name: "Galletas saladas", category: "cereal", cho: 70 },
    { name: "Cereal de caja azucarado", category: "cereal", cho: 84 },
    { name: "Quinoa cocida", category: "cereal", cho: 21 },
    { name: "Arepa", category: "cereal", cho: 43 },
    { name: "Cuscús cocido", category: "cereal", cho: 23 },

    // Tubérculos
    { name: "Papa", category: "tuberculo", cho: 17 },
    { name: "Papa frita (chips)", category: "tuberculo", cho: 53 },
    { name: "Puré de papa", category: "tuberculo", cho: 16 },
    { name: "Yuca", category: "tuberculo", cho: 38 },
    { name: "Camote / batata", category: "tuberculo", cho: 20 },

    // Legumbres
    { name: "Frijoles / porotos cocidos", category: "legumbre", cho: 24 },
    { name: "Lentejas cocidas", category: "legumbre", cho: 20 },
    { name: "Garbanzos cocidos", category: "legumbre", cho: 27 },
    { name: "Habas cocidas", category: "legumbre", cho: 20 },

    // Lácteos
    { name: "Leche entera", category: "lacteo", cho: 5 },
    { name: "Leche deslactosada", category: "lacteo", cho: 5 },
    { name: "Yogur natural", category: "lacteo", cho: 5 },
    { name: "Yogur de fruta", category: "lacteo", cho: 15 },
    { name: "Queso fresco", category: "lacteo", cho: 3 },
    { name: "Queso maduro", category: "lacteo", cho: 1 },
    { name: "Helado", category: "lacteo", cho: 22 },

    // Snacks y dulces
    { name: "Chocolate con leche", category: "snack", cho: 59 },
    { name: "Galletas dulces", category: "snack", cho: 68 },
    { name: "Torta / pastel", category: "snack", cho: 50 },
    { name: "Miel", category: "snack", cho: 82 },
    { name: "Azúcar de mesa", category: "snack", cho: 100 },
    { name: "Gomitas / dulces", category: "snack", cho: 77 },

    // Bebidas
    { name: "Agua", category: "bebida", cho: 0 },
    { name: "Jugo de naranja natural", category: "bebida", cho: 10 },
    { name: "Gaseosa / refresco", category: "bebida", cho: 11 },
    { name: "Bebida deportiva", category: "bebida", cho: 6 },
    { name: "Jugo de caja azucarado", category: "bebida", cho: 13 },
    { name: "Leche con chocolate", category: "bebida", cho: 11 },

    // Proteínas y grasas
    { name: "Pollo", category: "proteina", cho: 0 },
    { name: "Carne de res", category: "proteina", cho: 0 },
    { name: "Pescado", category: "proteina", cho: 0 },
    { name: "Atún en lata", category: "proteina", cho: 0 },
    { name: "Huevo", category: "proteina", cho: 1 },
    { name: "Jamón", category: "proteina", cho: 1 },
    { name: "Aceite de oliva", category: "proteina", cho: 0 },
    { name: "Mantequilla", category: "proteina", cho: 0 },
    { name: "Nueces", category: "proteina", cho: 14 },
    { name: "Maní / cacahuate", category: "proteina", cho: 16 },
  ].map((f, i) => ({ id: "f" + i, ...f }));

  /* ---------------------------------------------------------
     4. Calculadora — Reto 3: "Arma tu comida"
     --------------------------------------------------------- */
  const categoryTabsEl = $("#categoryTabs");
  const foodListEl = $("#foodList");
  const foodSearchEl = $("#foodSearch");
  const mealListEl = $("#mealList");
  const mealEmptyEl = $("#mealEmpty");
  const mealTotalEl = $("#mealTotal");

  let activeCategory = "todos";
  let meal = []; // { id, name, grams, cho }

  function renderCategoryTabs() {
    categoryTabsEl.innerHTML = CATEGORIES.map(
      (c) =>
        `<button type="button" class="category-tab${c.id === activeCategory ? " is-active" : ""}" data-cat="${c.id}">${c.label}</button>`
    ).join("");
  }

  categoryTabsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".category-tab");
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    renderCategoryTabs();
    renderFoodList();
  });

  function renderFoodList() {
    const query = foodSearchEl.value.trim().toLowerCase();
    const items = FOOD_DB.filter((f) => {
      const matchesCat = activeCategory === "todos" || f.category === activeCategory;
      const matchesQuery = !query || f.name.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });

    if (items.length === 0) {
      foodListEl.innerHTML = '<p class="food-list__empty">No encontramos ese alimento. Prueba con otra palabra.</p>';
      return;
    }

    foodListEl.innerHTML = items
      .map(
        (f) => `
      <div class="food-item" role="listitem">
        <div class="food-item__main">
          <div class="food-item__icon">${ICONS[f.category]}</div>
          <div class="food-item__info">
            <div class="food-item__name">${f.name}</div>
            <div class="food-item__meta">${f.cho} g CHO / 100 g</div>
          </div>
        </div>
        <div class="food-item__actions">
          <input type="number" min="1" step="1" value="100" aria-label="Gramos de ${f.name}" data-grams="${f.id}">
          <button type="button" class="food-item__add" data-add="${f.id}" aria-label="Agregar ${f.name} al plato">+</button>
        </div>
      </div>`
      )
      .join("");
  }

  function renderMealLevelLegend() {
    const legendEl = $("#mealLevelLegend");
    if (!legendEl) return;
    const t = MEAL_LEVEL_THRESHOLDS;
    legendEl.innerHTML = `
      <span class="level-legend__item"><i class="level-dot level-dot--low"></i>Bajo: 0–${t.low} g</span>
      <span class="level-legend__item"><i class="level-dot level-dot--medium"></i>Medio: ${t.low + 1}–${t.medium} g</span>
      <span class="level-legend__item"><i class="level-dot level-dot--high"></i>Alto: más de ${t.medium} g</span>
    `;
  }

  foodSearchEl.addEventListener("input", renderFoodList);

  foodListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    const food = FOOD_DB.find((f) => f.id === id);
    const gramsInput = foodListEl.querySelector(`[data-grams="${id}"]`);
    const grams = Math.max(1, Number(gramsInput.value) || 100);
    const cho = round1((food.cho * grams) / 100);

    meal.push({ uid: Date.now() + Math.random(), name: food.name, grams, cho });
    renderMeal();

    if (meal.length === 3 && !score.reto3) addPoints(20, "reto3");
  });

  function renderMeal() {
    if (meal.length === 0) {
      mealListEl.innerHTML = '<li class="meal-tray__empty" id="mealEmpty">Aún no has agregado alimentos. ¡Busca y arma tu plato!</li>';
    } else {
      mealListEl.innerHTML = meal
        .map(
          (m) => `
        <li class="meal-tray__row">
          <span>${m.name} — ${m.grams} g (${m.cho} g CHO)</span>
          <button type="button" data-remove="${m.uid}" aria-label="Quitar ${m.name}">✕</button>
        </li>`
        )
        .join("");
    }
    const total = round1(meal.reduce((sum, m) => sum + m.cho, 0));
    mealTotalEl.textContent = total + " g";

    const level = getMealLevel(total);
    const totalCard = $("#mealTotalCard");
    totalCard.className = "meal-tray__total meal-tray__total--level-" + level;
    $("#mealLevelBadge").textContent = MEAL_LEVEL_LABELS[level];
    $("#mealLevelBadge").className = "level-badge level-badge--" + level;
  }

  mealListEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const uid = Number(btn.dataset.remove);
    meal = meal.filter((m) => m.uid !== uid);
    renderMeal();
  });

  function clearMeal() {
    meal = [];
    renderMeal();
  }
  $("#mealReset").addEventListener("click", clearMeal);

  renderCategoryTabs();
  renderMealLevelLegend();
  renderFoodList();
  renderMeal();

  /* ---------------------------------------------------------
     5. Reto 1 — "¿Dónde están los CHO?"
     --------------------------------------------------------- */
  const RETO1_ITEMS = [
    { name: "Manzana", category: "fruta", hasCho: true },
    { name: "Pan", category: "cereal", hasCho: true },
    { name: "Arroz", category: "cereal", hasCho: true },
    { name: "Pollo", category: "proteina", hasCho: false },
    { name: "Queso maduro", category: "lacteo", hasCho: false },
    { name: "Naranja", category: "fruta", hasCho: true },
    { name: "Huevo", category: "proteina", hasCho: false },
    { name: "Papa", category: "tuberculo", hasCho: true },
    { name: "Aceite de oliva", category: "proteina", hasCho: false },
    { name: "Yogur de fruta", category: "lacteo", hasCho: true },
    { name: "Pescado", category: "proteina", hasCho: false },
    { name: "Pasta", category: "cereal", hasCho: true },
  ];

  const reto1Grid = $("#reto1Grid");
  const reto1Feedback = $("#reto1Feedback");
  let reto1Selected = new Set();
  let reto1Checked = false;

  function renderReto1() {
    reto1Grid.innerHTML = RETO1_ITEMS.map(
      (item, i) => `
      <button type="button" class="food-chip" data-index="${i}">
        <span class="food-chip__icon">${ICONS[item.category]}</span>
        ${item.name}
      </button>`
    ).join("");
  }

  reto1Grid.addEventListener("click", (e) => {
    if (reto1Checked) return;
    const chip = e.target.closest(".food-chip");
    if (!chip) return;
    const index = Number(chip.dataset.index);
    if (reto1Selected.has(index)) {
      reto1Selected.delete(index);
      chip.classList.remove("is-selected");
    } else {
      reto1Selected.add(index);
      chip.classList.add("is-selected");
    }
  });

  $("#reto1Check").addEventListener("click", () => {
    if (reto1Checked) return;
    reto1Checked = true;
    let correct = 0;

    $$(".food-chip", reto1Grid).forEach((chip) => {
      const index = Number(chip.dataset.index);
      const item = RETO1_ITEMS[index];
      const wasSelected = reto1Selected.has(index);
      const isCorrect = wasSelected === item.hasCho;
      if (isCorrect) {
        correct++;
        if (wasSelected) chip.classList.add("is-correct");
      } else {
        chip.classList.add("is-incorrect");
      }
    });

    const total = RETO1_ITEMS.length;
    reto1Feedback.textContent = `Acertaste ${correct} de ${total}. ${correct === total ? "¡Equipazo, todo correcto!" : "Revisa los marcados en rojo y vuelve a intentarlo."}`;
    reto1Feedback.className = "challenge__feedback " + (correct === total ? "is-correct" : "is-wrong");

    if (correct === total && !score.reto1) {
      addPoints(20, "reto1");
    } else if (correct > 0) {
      addPoints(Math.round((correct / total) * 10));
    }
  });

  function resetReto1() {
    reto1Selected = new Set();
    reto1Checked = false;
    reto1Feedback.textContent = "";
    reto1Feedback.className = "challenge__feedback";
    renderReto1();
  }
  $("#reto1Reset").addEventListener("click", resetReto1);
  renderReto1();

  /* ---------------------------------------------------------
     6. Reto 2 — "¿Cuántos CHO tiene?" (lectura de etiqueta)
     --------------------------------------------------------- */
  const LABELS = [
    { portionSize: "2 galletas (30 g)", servings: 4, choPerServing: 20, question: "Si te comes toda la caja (4 porciones), ¿cuántos gramos de CHO comerás en total?" },
    { portionSize: "1 vaso (200 ml)", servings: 3, choPerServing: 12, question: "Si te tomas 2 vasos, ¿cuántos gramos de CHO son?" },
    { portionSize: "1/2 taza (100 g)", servings: 2, choPerServing: 28, question: "Si te comes el envase completo (2 porciones), ¿cuántos gramos de CHO son en total?" },
  ];

  let labelIndex = 0;
  let labelRoundsOk = 0;

  function loadLabel() {
    const label = LABELS[labelIndex];
    $("#labelPortionSize").textContent = label.portionSize;
    $("#labelServings").textContent = label.servings;
    $("#labelChoPerServing").textContent = label.choPerServing + " g";
    $("#labelQuestionText").textContent = label.question;
    $("#labelAnswer").value = "";
    $("#labelFeedback").textContent = "";
    $("#labelFeedback").className = "challenge__feedback";
    $("#labelNext").hidden = true;
    $("#labelAnswer").disabled = false;
    $("#labelCheck").disabled = false;
  }

  function initLabelQuiz() {
    labelIndex = 0;
    labelRoundsOk = 0;
    loadLabel();
  }

  $("#labelCheck").addEventListener("click", () => {
    const label = LABELS[labelIndex];
    const answer = Number($("#labelAnswer").value);
    // La pregunta multiplica choPerServing por el número de porciones mencionado (2 para el caso de "2 vasos")
    const multiplier = labelIndex === 1 ? 2 : label.servings;
    const correctAnswer = label.choPerServing * multiplier;
    const feedback = $("#labelFeedback");

    if (Math.abs(answer - correctAnswer) < 0.6) {
      feedback.textContent = `¡Correcto! Son ${correctAnswer} g de CHO.`;
      feedback.className = "challenge__feedback is-correct";
      labelRoundsOk++;
    } else {
      feedback.textContent = `Casi. La respuesta correcta es ${correctAnswer} g. Pista: multiplica los CHO por porción por la cantidad de porciones.`;
      feedback.className = "challenge__feedback is-wrong";
    }

    $("#labelAnswer").disabled = true;
    $("#labelCheck").disabled = true;

    if (labelIndex < LABELS.length - 1) {
      $("#labelNext").hidden = false;
    } else {
      addPoints(labelRoundsOk * 5, "reto2");
    }
  });

  $("#labelNext").addEventListener("click", () => {
    labelIndex++;
    loadLabel();
  });

  initLabelQuiz();

  /* ---------------------------------------------------------
     7. Reto final — "¡Penalti de CHO!"
     --------------------------------------------------------- */
  const PENALTY_CASES = [
    { text: "Antes de entrenar comerás 1 banano (23 g CHO/100 g, pesa 120 g) y un vaso de bebida deportiva de 250 ml (6 g CHO/100 ml). ¿Cuántos gramos de CHO en total?", answer: round1(23 * 1.2 + 6 * 2.5) },
    { text: "En el medio tiempo comes 2 unidades de pan (49 g CHO/100 g, cada una pesa 50 g). ¿Cuántos gramos de CHO en total?", answer: round1(49 * 0.5 * 2) },
    { text: "De cena tienes 150 g de arroz cocido (28 g CHO/100 g) y 100 g de lentejas cocidas (20 g CHO/100 g). ¿Cuántos gramos de CHO en total?", answer: round1(28 * 1.5 + 20 * 1) },
  ];

  let penaltyRound = 0;
  let penaltyGoals = 0;
  const penaltyBall = $("#penaltyBall");
  const keeper = $("#keeper");

  function loadPenalty() {
    const c = PENALTY_CASES[penaltyRound];
    $("#penaltyCase").textContent = c.text;
    $("#penaltyAnswer").value = "";
    $("#penaltyAnswer").disabled = false;
    $("#penaltyKick").disabled = false;
    $("#penaltyFeedback").textContent = "";
    $("#penaltyFeedback").className = "challenge__feedback";
    $("#penaltyResult").textContent = "";
    $("#penaltyNext").hidden = true;
    $("#penaltyRound").textContent = String(penaltyRound + 1);
    penaltyBall.setAttribute("cx", "150");
    penaltyBall.setAttribute("cy", "140");
    penaltyBall.style.transform = "none";
    keeper.style.transform = "none";
  }

  function initPenalty() {
    penaltyRound = 0;
    penaltyGoals = 0;
    loadPenalty();
  }

  $("#penaltyKick").addEventListener("click", () => {
    const c = PENALTY_CASES[penaltyRound];
    const answer = Number($("#penaltyAnswer").value);
    const isGoal = Math.abs(answer - c.answer) < 0.6;
    const resultEl = $("#penaltyResult");
    const feedback = $("#penaltyFeedback");

    if (isGoal) {
      penaltyBall.style.transform = "translate(40px, -95px) scale(0.7)";
      resultEl.textContent = "¡GOOOL!";
      feedback.textContent = `¡Excelente cálculo! La respuesta era ${c.answer} g de CHO.`;
      feedback.className = "challenge__feedback is-correct";
      penaltyGoals++;
    } else {
      keeper.style.transform = "translate(30px, 10px)";
      resultEl.textContent = "¡Atajada!";
      feedback.textContent = `Esta vez no fue gol. La respuesta correcta era ${c.answer} g de CHO.`;
      feedback.className = "challenge__feedback is-wrong";
    }

    $("#penaltyAnswer").disabled = true;
    $("#penaltyKick").disabled = true;

    if (penaltyRound < PENALTY_CASES.length - 1) {
      $("#penaltyNext").hidden = false;
    } else {
      addPoints(penaltyGoals * 10, "retoFinal");
    }
  });

  $("#penaltyNext").addEventListener("click", () => {
    penaltyRound++;
    loadPenalty();
  });

  initPenalty();
})();
