/* ============================================================
   WEEKLY MEALS — app.js
   ============================================================ */

'use strict';

// ── Constants ────────────────────────────────────────────────
const STORAGE = { RECIPES: 'wm_recipes', PLAN: 'wm_plan' };

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_LONG  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEALS = ['breakfast','lunch','dinner'];
const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

// Gradient palettes for placeholder images (index by hash of name)
const GRADIENTS = [
  ['#f97316','#ef4444'],
  ['#8b5cf6','#ec4899'],
  ['#06b6d4','#3b82f6'],
  ['#10b981','#84cc16'],
  ['#f59e0b','#f97316'],
  ['#ec4899','#8b5cf6'],
  ['#14b8a6','#06b6d4'],
  ['#6366f1','#8b5cf6'],
];

const RECIPE_EMOJIS = ['🍝','🍗','🥗','🍜','🌮','🍣','🥘','🍖','🥙','🍛','🫕','🥩'];

// ── State ─────────────────────────────────────────────────────
let state = {
  view: 'calendar',       // 'calendar' | 'library'
  recipes: [],            // Recipe[]
  plan: {},               // { monday: { breakfast: id|null, lunch: id|null, dinner: id|null }, ... }
  modal: null,            // null | { type, ... }
};

// ── Persistence ───────────────────────────────────────────────
function loadState() {
  try {
    const r = localStorage.getItem(STORAGE.RECIPES);
    const p = localStorage.getItem(STORAGE.PLAN);
    state.recipes = r ? JSON.parse(r) : buildSampleRecipes();
    state.plan    = p ? JSON.parse(p) : buildSamplePlan(state.recipes);
    if (!p) saveState(); // persist defaults
  } catch (e) {
    state.recipes = buildSampleRecipes();
    state.plan    = buildSamplePlan(state.recipes);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE.RECIPES, JSON.stringify(state.recipes));
    localStorage.setItem(STORAGE.PLAN,    JSON.stringify(state.plan));
  } catch(e) {
    console.warn('Storage full — could not save.', e);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getRecipe(id) {
  return state.recipes.find(r => r.id === id) || null;
}

function gradientFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

function emojiFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 17 + name.charCodeAt(i)) & 0xffff;
  return RECIPE_EMOJIS[h % RECIPE_EMOJIS.length];
}

function formatMins(mins) {
  if (!mins) return '';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// Determine which day-of-week column index (0=Mon … 6=Sun) matches today
function todayIndex() {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1;
}

// Get display date for a day column (relative to this Monday)
function dateForCol(colIdx) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const target = new Date(monday);
  target.setDate(monday.getDate() + colIdx);
  return target;
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Sample data ───────────────────────────────────────────────
function buildSampleRecipes() {
  return [
    {
      id: uid(),
      name: 'Spaghetti Bolognese',
      image: '',
      cookTime: 45,
      servings: 4,
      ingredients: [
        '400g minced beef',
        '2 onions, finely chopped',
        '3 garlic cloves, minced',
        '2 cans (800g) chopped tomatoes',
        '200g spaghetti per person',
        '2 tbsp olive oil',
        'Salt, pepper, mixed herbs',
        'Parmesan to serve',
      ],
      method: [
        'Heat olive oil in a large pan over medium-high heat. Add onions and cook for 5 minutes until softened.',
        'Add garlic and cook for 1 minute. Add the minced beef and brown thoroughly, breaking it up as you go.',
        'Pour in the chopped tomatoes, add herbs, salt and pepper. Simmer uncovered for 25–30 minutes.',
        'Cook spaghetti according to packet instructions. Drain, reserving a cup of pasta water.',
        'Combine pasta with the sauce, adding pasta water to loosen if needed. Serve with Parmesan.',
      ],
    },
    {
      id: uid(),
      name: 'Chicken Stir Fry',
      image: '',
      cookTime: 25,
      servings: 4,
      ingredients: [
        '600g chicken breast, sliced',
        '2 peppers, sliced',
        '2 carrots, julienned',
        '200g tenderstem broccoli',
        '3 tbsp soy sauce',
        '1 tbsp oyster sauce',
        '1 tbsp sesame oil',
        '2 garlic cloves, minced',
        '1 tsp fresh ginger, grated',
        'Cooked rice to serve',
      ],
      method: [
        'Mix soy sauce, oyster sauce and sesame oil in a bowl. Set aside.',
        'Heat a wok or large pan until very hot. Add oil and stir-fry chicken for 4–5 minutes until golden.',
        'Remove chicken. Add garlic, ginger, carrots and broccoli. Stir-fry for 3 minutes.',
        'Add peppers and cook for 2 more minutes.',
        'Return chicken to the wok, pour over the sauce and toss everything together for 1–2 minutes. Serve with rice.',
      ],
    },
    {
      id: uid(),
      name: 'Veggie Curry',
      image: '',
      cookTime: 40,
      servings: 4,
      ingredients: [
        '1 can (400ml) coconut milk',
        '1 can (400g) chickpeas, drained',
        '2 sweet potatoes, cubed',
        '200g spinach',
        '1 onion, diced',
        '3 garlic cloves, minced',
        '1 can chopped tomatoes',
        '2 tbsp curry paste (medium)',
        '1 tsp turmeric',
        'Naan or rice to serve',
      ],
      method: [
        'Fry onion in oil for 5 minutes. Add garlic and curry paste, cook for 2 minutes until fragrant.',
        'Add sweet potato, chopped tomatoes, turmeric and coconut milk. Stir well.',
        'Bring to a simmer, cover and cook for 20 minutes until sweet potato is tender.',
        'Stir in chickpeas and spinach. Cook for 5 more minutes.',
        'Taste and adjust seasoning. Serve with warm naan or basmati rice.',
      ],
    },
    {
      id: uid(),
      name: 'Grilled Salmon',
      image: '',
      cookTime: 20,
      servings: 4,
      ingredients: [
        '4 salmon fillets',
        '2 tbsp olive oil',
        '2 garlic cloves, minced',
        'Juice of 1 lemon',
        '1 tsp dried dill or fresh',
        'Salt and black pepper',
        'New potatoes and green beans to serve',
      ],
      method: [
        'Mix olive oil, garlic, lemon juice, dill, salt and pepper in a bowl.',
        'Brush the salmon fillets all over with the marinade. Leave for 10 minutes.',
        'Preheat grill to high. Place salmon skin-side up on a lined baking tray.',
        'Grill for 4–5 minutes, flip and grill a further 3–4 minutes until cooked through.',
        'Serve with boiled new potatoes and steamed green beans.',
      ],
    },
    {
      id: uid(),
      name: 'Beef Tacos',
      image: '',
      cookTime: 30,
      servings: 4,
      ingredients: [
        '500g minced beef',
        '8 small corn or flour tortillas',
        '1 onion, diced',
        '2 garlic cloves, minced',
        '2 tsp cumin',
        '1 tsp smoked paprika',
        '1 tsp chilli powder',
        'Toppings: salsa, sour cream, cheese, lettuce, lime',
      ],
      method: [
        'Brown the minced beef in a hot pan with a little oil, breaking up lumps.',
        'Add onion and garlic, cook for 3 minutes. Drain excess fat.',
        'Stir in cumin, paprika, chilli powder and a splash of water. Cook for 5 minutes.',
        'Warm tortillas in a dry pan or microwave for 20 seconds.',
        'Fill tortillas with beef and your choice of toppings. Squeeze over lime juice.',
      ],
    },
    {
      id: uid(),
      name: 'Pancakes',
      image: '',
      cookTime: 20,
      servings: 4,
      ingredients: [
        '200g plain flour',
        '2 tsp baking powder',
        '2 tbsp sugar',
        'Pinch of salt',
        '2 eggs',
        '300ml milk',
        '2 tbsp melted butter',
        'Maple syrup and berries to serve',
      ],
      method: [
        'Whisk together flour, baking powder, sugar and salt in a large bowl.',
        'In another bowl beat eggs, then stir in milk and melted butter.',
        'Pour wet ingredients into dry and stir until just combined — lumps are fine.',
        'Heat a non-stick pan over medium heat with a little butter. Pour in ¼ cup of batter.',
        'Cook until bubbles form on the surface (about 2 minutes), flip and cook 1 more minute. Serve with maple syrup and berries.',
      ],
    },
    {
      id: uid(),
      name: 'Homemade Pizza',
      image: '',
      cookTime: 35,
      servings: 4,
      ingredients: [
        '500g strong white bread flour',
        '7g fast-action yeast',
        '1 tsp sugar',
        '300ml warm water',
        '2 tbsp olive oil',
        '200ml passata',
        '200g mozzarella, torn',
        'Toppings of your choice',
      ],
      method: [
        'Mix flour, yeast, sugar and 1 tsp salt. Add water and oil, mix to a dough.',
        'Knead on a floured surface for 8–10 minutes until smooth. Cover and rest 1 hour.',
        'Preheat oven to 240°C / 220°C fan. Divide dough into 2–4 balls.',
        'Roll out thinly on floured baking sheets. Spread passata, add mozzarella and toppings.',
        'Bake for 10–12 minutes until crust is golden and cheese is bubbling.',
      ],
    },
    {
      id: uid(),
      name: 'Roast Chicken',
      image: '',
      cookTime: 90,
      servings: 4,
      ingredients: [
        '1 whole chicken (about 1.8kg)',
        '1 lemon, halved',
        '1 whole garlic bulb, halved',
        '50g butter, softened',
        'Fresh thyme or rosemary',
        'Salt and black pepper',
        'Roast potatoes and vegetables to serve',
      ],
      method: [
        'Preheat oven to 200°C / 180°C fan. Pat the chicken dry with kitchen paper.',
        'Mix butter with herbs, salt and pepper. Push under the skin over the breast.',
        'Stuff the cavity with lemon and garlic. Season the outside well.',
        'Roast for 20 minutes per 500g plus 20 minutes extra (about 90 min for 1.8kg). Baste halfway through.',
        'Rest for 15 minutes before carving. Serve with roast potatoes and seasonal veg.',
      ],
    },
  ];
}

function buildSamplePlan(recipes) {
  const plan = {};
  DAYS.forEach(d => {
    plan[d] = { breakfast: null, lunch: null, dinner: null };
  });
  // Assign a few dinners to give a nice first impression
  const dinners = [recipes[0], recipes[1], recipes[2], recipes[3], recipes[7]];
  const planDays = ['monday','tuesday','wednesday','thursday','sunday'];
  dinners.forEach((r, i) => {
    if (r && planDays[i]) plan[planDays[i]].dinner = r.id;
  });
  // A couple of breakfasts
  if (recipes[5]) plan['saturday'].breakfast = recipes[5].id;
  return plan;
}

// ── Render helpers ────────────────────────────────────────────
function recipeThumbnailHtml(recipe, cls, size = 44) {
  if (recipe.image) {
    return `<img class="${cls}" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.name)}" loading="lazy">`;
  }
  const [c1, c2] = gradientFor(recipe.name);
  const emoji = emojiFor(recipe.name);
  return `<div class="${cls}" style="background:linear-gradient(135deg,${c1},${c2})">${emoji}</div>`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// ── RENDER ────────────────────────────────────────────────────
function render() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === state.view);
  });

  const main = document.getElementById('main');
  if (state.view === 'calendar') {
    main.innerHTML = renderCalendar();
  } else {
    main.innerHTML = renderLibrary();
  }

  bindMainEvents();
}

// ── Calendar view ─────────────────────────────────────────────
function renderCalendar() {
  const today = todayIndex();

  // Build desktop grid columns
  const gridCols = DAYS.map((day, i) => {
    const date = dateForCol(i);
    const isToday = i === today;
    const mealSlots = MEALS.map(meal => {
      const recipeId = state.plan[day]?.[meal];
      const recipe = recipeId ? getRecipe(recipeId) : null;
      if (recipe) {
        const thumb = recipe.image
          ? `<img class="cal-recipe-thumb" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.name)}" loading="lazy">`
          : (() => {
              const [c1, c2] = gradientFor(recipe.name);
              return `<div class="cal-recipe-thumb-placeholder" style="background:linear-gradient(135deg,${c1},${c2})">${emojiFor(recipe.name)}</div>`;
            })();
        return `
          <div class="meal-slot">
            <span class="meal-label">${MEAL_LABEL[meal][0]}</span>
            <button class="cal-recipe-card" data-action="view-recipe-cal" data-day="${day}" data-meal="${meal}" aria-label="${escHtml(recipe.name)}">
              ${thumb}
              <div class="cal-recipe-name">${escHtml(recipe.name)}</div>
            </button>
          </div>`;
      }
      return `
        <div class="meal-slot">
          <span class="meal-label">${MEAL_LABEL[meal][0]}</span>
          <button class="cal-empty-slot" data-action="pick-recipe" data-day="${day}" data-meal="${meal}" aria-label="Add ${MEAL_LABEL[meal]} for ${DAY_LONG[i]}">+</button>
        </div>`;
    }).join('');

    return `
      <div class="day-col${isToday ? ' today' : ''}">
        <div class="day-heading">
          <div class="day-name">${DAY_SHORT[i]}</div>
          <div class="day-date">${date.getDate()}</div>
        </div>
        ${mealSlots}
      </div>`;
  }).join('');

  // Build mobile list cards
  const listCards = DAYS.map((day, i) => {
    const date = dateForCol(i);
    const isToday = i === today;
    const mealRows = MEALS.map(meal => {
      const recipeId = state.plan[day]?.[meal];
      const recipe = recipeId ? getRecipe(recipeId) : null;
      if (recipe) {
        const thumb = recipe.image
          ? `<img class="meal-row-thumb" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.name)}" loading="lazy">`
          : (() => {
              const [c1, c2] = gradientFor(recipe.name);
              return `<div class="meal-row-thumb-placeholder" style="background:linear-gradient(135deg,${c1},${c2})">${emojiFor(recipe.name)}</div>`;
            })();
        return `
          <div class="meal-row">
            <span class="meal-row-label">${MEAL_LABEL[meal]}</span>
            <button class="meal-row-recipe" data-action="view-recipe-cal" data-day="${day}" data-meal="${meal}" aria-label="${escHtml(recipe.name)}">
              ${thumb}
              <div class="meal-row-recipe-name">${escHtml(recipe.name)}</div>
              <span class="meal-row-recipe-arrow">›</span>
            </button>
          </div>`;
      }
      return `
        <div class="meal-row">
          <span class="meal-row-label">${MEAL_LABEL[meal]}</span>
          <button class="meal-row-empty" data-action="pick-recipe" data-day="${day}" data-meal="${meal}" aria-label="Add ${MEAL_LABEL[meal]}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add meal
          </button>
        </div>`;
    }).join('');

    return `
      <div class="day-card${isToday ? ' today' : ''}">
        <div class="day-card-header">
          <span class="day-card-name">${DAY_LONG[i]}</span>
          <span class="day-card-date">${formatDate(date)}</span>
        </div>
        <div class="meal-rows">${mealRows}</div>
      </div>`;
  }).join('');

  return `
    <div class="calendar-view">
      <div class="calendar-header">
        <h1 class="calendar-title">This Week</h1>
        <button class="btn-clear-week" data-action="clear-week">Clear week</button>
      </div>
      <div class="days-grid">${gridCols}</div>
      <div class="days-list">${listCards}</div>
    </div>`;
}

// ── Library view ──────────────────────────────────────────────
function renderLibrary() {
  if (state.recipes.length === 0) {
    return `
      <div class="library-view">
        <div class="library-header">
          <h1 class="library-title">Recipes</h1>
          <button class="btn-add-recipe" data-action="add-recipe">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Recipe
          </button>
        </div>
        <div class="empty-state">
          <div class="empty-state-icon">📖</div>
          <div class="empty-state-title">No recipes yet</div>
          <div class="empty-state-body">Add your first recipe to start planning your weekly meals.</div>
          <button class="btn-primary" style="display:inline-flex;align-items:center;gap:8px;flex:none;padding:12px 24px;border-radius:10px;" data-action="add-recipe">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Recipe
          </button>
        </div>
      </div>`;
  }

  const cards = state.recipes.map(recipe => {
    const img = recipe.image
      ? `<img class="recipe-card-image" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.name)}" loading="lazy">`
      : (() => {
          const [c1, c2] = gradientFor(recipe.name);
          return `<div class="recipe-card-image-placeholder" style="background:linear-gradient(135deg,${c1},${c2})">${emojiFor(recipe.name)}</div>`;
        })();

    const timeChip = recipe.cookTime
      ? `<span class="recipe-meta-chip">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          ${formatMins(recipe.cookTime)}
        </span>` : '';

    const servingsChip = recipe.servings
      ? `<span class="recipe-meta-chip">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Serves ${recipe.servings}
        </span>` : '';

    return `
      <button class="recipe-card" data-action="view-recipe" data-id="${recipe.id}" aria-label="${escHtml(recipe.name)}">
        ${img}
        <div class="recipe-card-body">
          <div class="recipe-card-name">${escHtml(recipe.name)}</div>
          <div class="recipe-card-meta">${timeChip}${servingsChip}</div>
        </div>
      </button>`;
  }).join('');

  return `
    <div class="library-view">
      <div class="library-header">
        <h1 class="library-title">Recipes</h1>
        <button class="btn-add-recipe" data-action="add-recipe">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Recipe
        </button>
      </div>
      <div class="recipe-grid">${cards}</div>
    </div>`;
}

// ── Bind events on main content ───────────────────────────────
function bindMainEvents() {
  document.getElementById('main').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'view-recipe') {
      openRecipeDetailModal(btn.dataset.id);
    } else if (action === 'view-recipe-cal') {
      openRecipeCalModal(btn.dataset.day, btn.dataset.meal);
    } else if (action === 'pick-recipe') {
      openRecipePicker(btn.dataset.day, btn.dataset.meal);
    } else if (action === 'add-recipe') {
      openRecipeForm(null);
    } else if (action === 'clear-week') {
      confirmClearWeek();
    }
  });
}

// ── MODALS ────────────────────────────────────────────────────
function showModal(html) {
  const overlay = document.getElementById('overlay');
  const modal   = document.getElementById('modal');
  modal.innerHTML = html;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  // Trigger transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
      modal.classList.add('visible');
    });
  });
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  const overlay = document.getElementById('overlay');
  const modal   = document.getElementById('modal');
  overlay.classList.remove('visible');
  modal.classList.remove('visible');
  setTimeout(() => {
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
    modal.innerHTML = '';
    document.body.style.overflow = '';
  }, 250);
}

// ── Recipe Detail Modal ───────────────────────────────────────
function openRecipeDetailModal(recipeId, context) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;

  const img = recipe.image
    ? `<img class="recipe-detail-image" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.name)}">`
    : (() => {
        const [c1, c2] = gradientFor(recipe.name);
        return `<div class="recipe-detail-image-placeholder" style="background:linear-gradient(135deg,${c1},${c2})">${emojiFor(recipe.name)}</div>`;
      })();

  const stats = [
    recipe.cookTime ? `<div class="recipe-stat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${formatMins(recipe.cookTime)}</div>` : '',
    recipe.servings ? `<div class="recipe-stat"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Serves ${recipe.servings}</div>` : '',
  ].filter(Boolean).join('');

  const ingredients = recipe.ingredients.length
    ? `<div class="recipe-section">
        <div class="recipe-section-title">Ingredients</div>
        <ul class="ingredient-list">
          ${recipe.ingredients.map(ing => `
            <li class="ingredient-item">
              <span class="ingredient-dot"></span>
              <span>${escHtml(ing)}</span>
            </li>`).join('')}
        </ul>
      </div>` : '';

  const methodItems = Array.isArray(recipe.method) ? recipe.method : [recipe.method];
  const method = methodItems.length && methodItems[0]
    ? `<div class="recipe-section">
        <div class="recipe-section-title">Method</div>
        <div class="method-steps">
          ${methodItems.map((step, i) => `
            <div class="method-step">
              <div class="step-num">${i + 1}</div>
              <div>${escHtml(step)}</div>
            </div>`).join('')}
        </div>
      </div>` : '';

  const contextActions = context
    ? `<button class="btn-danger" data-action="remove-from-day" data-day="${context.day}" data-meal="${context.meal}">Remove from plan</button>`
    : '';

  const html = `
    <div class="modal-handle"></div>
    <div class="recipe-detail">
      ${img}
      <div class="recipe-detail-body">
        <div class="recipe-detail-top">
          <h2 class="recipe-detail-title">${escHtml(recipe.name)}</h2>
          <button class="recipe-detail-close" data-action="close-modal" aria-label="Close">✕</button>
        </div>
        <div class="recipe-stats">${stats}</div>
        ${ingredients}
        ${method}
        <div class="recipe-detail-actions">
          <button class="btn-secondary" data-action="edit-recipe" data-id="${recipe.id}">Edit Recipe</button>
          ${contextActions}
        </div>
      </div>
    </div>`;

  showModal(html);
  bindModalEvents();
}

function openRecipeCalModal(day, meal) {
  const recipeId = state.plan[day]?.[meal];
  if (!recipeId) return;
  openRecipeDetailModal(recipeId, { day, meal });
}

// ── Recipe Picker Modal ───────────────────────────────────────
function openRecipePicker(day, meal) {
  const renderList = (filter = '') => {
    const filtered = state.recipes.filter(r =>
      r.name.toLowerCase().includes(filter.toLowerCase())
    );
    if (!filtered.length) {
      return `<div class="empty-state" style="padding:40px 20px">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No recipes found</div>
        <div class="empty-state-body">Try a different search, or add a new recipe from the Recipes tab.</div>
      </div>`;
    }
    return filtered.map(recipe => {
      const thumb = recipe.image
        ? `<img class="picker-thumb" src="${escHtml(recipe.image)}" alt="${escHtml(recipe.name)}" loading="lazy">`
        : (() => {
            const [c1, c2] = gradientFor(recipe.name);
            return `<div class="picker-thumb-placeholder" style="background:linear-gradient(135deg,${c1},${c2})">${emojiFor(recipe.name)}</div>`;
          })();
      const meta = [
        recipe.cookTime ? formatMins(recipe.cookTime) : '',
        recipe.servings ? `Serves ${recipe.servings}` : '',
      ].filter(Boolean).join(' · ');
      return `
        <button class="picker-recipe-row" data-action="assign-recipe" data-id="${recipe.id}" data-day="${day}" data-meal="${meal}">
          ${thumb}
          <div class="picker-info">
            <div class="picker-recipe-name">${escHtml(recipe.name)}</div>
            ${meta ? `<div class="picker-recipe-meta">${escHtml(meta)}</div>` : ''}
          </div>
          <div class="picker-check">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </button>`;
    }).join('');
  };

  const html = `
    <div class="modal-handle"></div>
    <div class="picker-header">
      <div class="picker-title-row">
        <h2 class="picker-title">Choose a Recipe</h2>
        <button class="picker-close" data-action="close-modal" aria-label="Close">✕</button>
      </div>
      <input class="search-input" id="picker-search" type="search" placeholder="Search recipes…" autocomplete="off">
    </div>
    <div class="picker-list" id="picker-list">${renderList()}</div>`;

  showModal(html);
  bindModalEvents();

  const searchEl = document.getElementById('picker-search');
  const listEl   = document.getElementById('picker-list');
  if (searchEl && listEl) {
    searchEl.addEventListener('input', () => {
      listEl.innerHTML = renderList(searchEl.value);
      bindModalEvents();
    });
    searchEl.focus();
  }
}

// ── Recipe Form Modal ─────────────────────────────────────────
function openRecipeForm(recipeId) {
  const recipe = recipeId ? getRecipe(recipeId) : null;
  const isEdit = !!recipe;

  const ingredients = (recipe?.ingredients?.length ? recipe.ingredients : ['',''])
    .map((ing, i) => `
      <div class="ingredient-input-row" data-ingredient-row>
        <input class="form-input" type="text" value="${escHtml(ing)}" placeholder="e.g. 200g pasta" data-ingredient-input>
        <button class="btn-icon btn-icon-danger" data-action="remove-ingredient" type="button" aria-label="Remove">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>`).join('');

  const methodText = recipe?.method
    ? (Array.isArray(recipe.method) ? recipe.method.join('\n\n') : recipe.method)
    : '';

  const imagePreview = recipe?.image
    ? `<img id="form-image-preview" class="image-upload-preview" src="${escHtml(recipe.image)}" alt="Preview">`
    : '';

  const deleteBtn = isEdit
    ? `<button class="btn-danger" data-action="delete-recipe" data-id="${recipe.id}" type="button">Delete</button>`
    : '';

  const html = `
    <div class="modal-handle"></div>
    <div class="form-header">
      <h2 class="form-title">${isEdit ? 'Edit Recipe' : 'New Recipe'}</h2>
      <div class="form-header-actions">
        ${deleteBtn}
        <button class="recipe-detail-close" data-action="close-modal" aria-label="Close">✕</button>
      </div>
    </div>
    <form id="recipe-form" data-recipe-id="${recipe?.id || ''}">
      <div class="form-body">

        <div class="form-group">
          <label class="form-label" for="field-name">Recipe Name *</label>
          <input class="form-input" id="field-name" type="text" value="${escHtml(recipe?.name || '')}" placeholder="e.g. Spaghetti Bolognese" required autocomplete="off">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="field-time">Cook Time (minutes)</label>
            <input class="form-input" id="field-time" type="number" min="1" max="480" value="${recipe?.cookTime || ''}" placeholder="e.g. 45">
          </div>
          <div class="form-group">
            <label class="form-label" for="field-servings">Servings</label>
            <input class="form-input" id="field-servings" type="number" min="1" max="20" value="${recipe?.servings || ''}" placeholder="e.g. 4">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Photo</label>
          <div class="image-upload-area" id="image-upload-area">
            ${imagePreview}
            <div id="upload-placeholder" style="${imagePreview ? 'display:none' : ''}">
              <div class="image-upload-icon">📷</div>
              <div class="image-upload-text">Tap to upload a photo</div>
              <div class="image-upload-hint">JPG, PNG, WebP</div>
            </div>
            <input type="file" id="field-image-file" accept="image/*">
          </div>
          <div class="image-url-row" style="margin-top:8px">
            <input class="form-input" id="field-image-url" type="url" value="${escHtml(recipe?.image || '')}" placeholder="Or paste an image URL">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Ingredients</label>
          <div class="ingredients-list" id="ingredients-list">${ingredients}</div>
          <button class="btn-add-ingredient" type="button" data-action="add-ingredient">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add ingredient
          </button>
        </div>

        <div class="form-group">
          <label class="form-label" for="field-method">Method</label>
          <textarea class="form-textarea" id="field-method" placeholder="Write each step on a new line…" rows="6">${escHtml(methodText)}</textarea>
        </div>

      </div>
      <div class="form-footer">
        <button class="btn-secondary" type="button" data-action="close-modal">Cancel</button>
        <button class="btn-primary" type="submit">${isEdit ? 'Save Changes' : 'Add Recipe'}</button>
      </div>
    </form>`;

  showModal(html);
  bindModalEvents();
  bindFormEvents();
}

function bindFormEvents() {
  const form = document.getElementById('recipe-form');
  if (!form) return;

  // Image file upload
  const fileInput = document.getElementById('field-image-file');
  const urlInput  = document.getElementById('field-image-url');
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (!file) return;
      compressAndPreview(file, url => {
        urlInput.value = url;
        showImagePreview(url);
      });
    });
  }
  if (urlInput) {
    urlInput.addEventListener('input', () => {
      if (urlInput.value) showImagePreview(urlInput.value);
    });
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    saveRecipeForm(form);
  });
}

function showImagePreview(url) {
  const area = document.getElementById('image-upload-area');
  const placeholder = document.getElementById('upload-placeholder');
  if (!area) return;
  let preview = document.getElementById('form-image-preview');
  if (!preview) {
    preview = document.createElement('img');
    preview.id = 'form-image-preview';
    preview.className = 'image-upload-preview';
    area.insertBefore(preview, area.firstChild);
  }
  preview.src = url;
  preview.style.display = 'block';
  if (placeholder) placeholder.style.display = 'none';
}

function compressAndPreview(file, callback) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function saveRecipeForm(form) {
  const name     = document.getElementById('field-name').value.trim();
  const cookTime = parseInt(document.getElementById('field-time').value) || 0;
  const servings = parseInt(document.getElementById('field-servings').value) || 0;
  const image    = document.getElementById('field-image-url')?.value?.trim() || '';
  const methodRaw = document.getElementById('field-method').value.trim();
  const method   = methodRaw ? methodRaw.split(/\n\s*\n+/).map(s => s.trim()).filter(Boolean) : [];
  const ingredients = Array.from(document.querySelectorAll('[data-ingredient-input]'))
    .map(el => el.value.trim())
    .filter(Boolean);

  if (!name) {
    document.getElementById('field-name').focus();
    return;
  }

  const recipeId = form.dataset.recipeId;
  if (recipeId) {
    const idx = state.recipes.findIndex(r => r.id === recipeId);
    if (idx !== -1) {
      state.recipes[idx] = { ...state.recipes[idx], name, cookTime, servings, image, ingredients, method };
    }
  } else {
    state.recipes.push({ id: uid(), name, cookTime, servings, image, ingredients, method });
  }

  saveState();
  hideModal();
  render();
}

// ── Bind modal events ─────────────────────────────────────────
function bindModalEvents() {
  const modal = document.getElementById('modal');
  if (!modal) return;

  modal.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'close-modal') {
      hideModal();
    } else if (action === 'edit-recipe') {
      hideModal();
      setTimeout(() => openRecipeForm(btn.dataset.id), 260);
    } else if (action === 'assign-recipe') {
      assignRecipe(btn.dataset.day, btn.dataset.meal, btn.dataset.id);
    } else if (action === 'remove-from-day') {
      removeFromDay(btn.dataset.day, btn.dataset.meal);
    } else if (action === 'delete-recipe') {
      confirmDeleteRecipe(btn.dataset.id);
    } else if (action === 'add-ingredient') {
      addIngredientRow();
    } else if (action === 'remove-ingredient') {
      btn.closest('[data-ingredient-row]')?.remove();
    }
  }, { capture: false });
}

function addIngredientRow() {
  const list = document.getElementById('ingredients-list');
  if (!list) return;
  const row = document.createElement('div');
  row.setAttribute('data-ingredient-row', '');
  row.className = 'ingredient-input-row';
  row.innerHTML = `
    <input class="form-input" type="text" placeholder="e.g. 200g pasta" data-ingredient-input>
    <button class="btn-icon btn-icon-danger" data-action="remove-ingredient" type="button" aria-label="Remove">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>`;
  list.appendChild(row);
  row.querySelector('input').focus();
}

// ── Data mutations ────────────────────────────────────────────
function assignRecipe(day, meal, recipeId) {
  if (!state.plan[day]) state.plan[day] = { breakfast: null, lunch: null, dinner: null };
  state.plan[day][meal] = recipeId;
  saveState();
  hideModal();
  render();
}

function removeFromDay(day, meal) {
  if (state.plan[day]) state.plan[day][meal] = null;
  saveState();
  hideModal();
  render();
}

function confirmClearWeek() {
  const html = `
    <div class="modal-handle"></div>
    <div class="confirm-dialog">
      <div class="confirm-icon">🗑️</div>
      <div class="confirm-title">Clear the whole week?</div>
      <div class="confirm-body">All meals will be removed from the calendar. Your recipes will not be deleted.</div>
      <div class="confirm-actions">
        <button class="btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn-danger" data-action="confirm-clear-week" style="flex:1">Clear week</button>
      </div>
    </div>`;
  showModal(html);
  bindModalEvents();
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.closest('[data-action="confirm-clear-week"]')) {
      DAYS.forEach(d => {
        state.plan[d] = { breakfast: null, lunch: null, dinner: null };
      });
      saveState();
      hideModal();
      render();
    }
  });
}

function confirmDeleteRecipe(recipeId) {
  const recipe = getRecipe(recipeId);
  if (!recipe) return;
  const html = `
    <div class="modal-handle"></div>
    <div class="confirm-dialog">
      <div class="confirm-icon">⚠️</div>
      <div class="confirm-title">Delete "${escHtml(recipe.name)}"?</div>
      <div class="confirm-body">This recipe will be permanently deleted and removed from any days it was assigned to.</div>
      <div class="confirm-actions">
        <button class="btn-secondary" data-action="close-modal">Cancel</button>
        <button class="btn-danger" data-action="confirm-delete" data-id="${recipeId}" style="flex:1">Delete</button>
      </div>
    </div>`;
  showModal(html);
  bindModalEvents();
  document.getElementById('modal').addEventListener('click', e => {
    const btn = e.target.closest('[data-action="confirm-delete"]');
    if (btn) {
      const id = btn.dataset.id;
      state.recipes = state.recipes.filter(r => r.id !== id);
      DAYS.forEach(d => {
        MEALS.forEach(m => {
          if (state.plan[d]?.[m] === id) state.plan[d][m] = null;
        });
      });
      saveState();
      hideModal();
      render();
    }
  });
}

// ── Tab navigation ────────────────────────────────────────────
function bindTabEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.view = btn.dataset.view;
      render();
    });
  });
}

// ── Overlay click to dismiss ──────────────────────────────────
function bindOverlayEvents() {
  document.getElementById('overlay').addEventListener('click', hideModal);
}

// ── PWA install banner ────────────────────────────────────────
let deferredInstallPrompt = null;

function bindInstallEvents() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) banner.classList.remove('hidden');
  });

  const btnInstall = document.getElementById('btn-install');
  const btnDismiss = document.getElementById('btn-install-dismiss');

  if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      document.getElementById('install-banner')?.classList.add('hidden');
    });
  }

  if (btnDismiss) {
    btnDismiss.addEventListener('click', () => {
      document.getElementById('install-banner')?.classList.add('hidden');
    });
  }
}

// ── Service worker registration ───────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

// ── Boot ──────────────────────────────────────────────────────
(function init() {
  loadState();
  render();
  bindTabEvents();
  bindOverlayEvents();
  bindInstallEvents();
  registerSW();
})();
