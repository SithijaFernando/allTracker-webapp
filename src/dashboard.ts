import { getAll, STORES } from "./storage/db";
import type { HealthEntry, Workout, Transaction, Habit, HabitLog } from "./types";
import { todayIso, formatDateTime } from "./utils/date";

export async function renderDashboard(root: HTMLElement) {
  const [health, workouts, transactions, habits, habitLogs] = await Promise.all([
    getAll<HealthEntry>(STORES.health),
    getAll<Workout>(STORES.workouts),
    getAll<Transaction>(STORES.transactions),
    getAll<Habit>(STORES.habits),
    getAll<HabitLog>(STORES.habitLogs),
  ]);

  const today = todayIso();
  const latestWeight = [...health].sort((a, b) => b.date.localeCompare(a.date))[0];

  const net =
    transactions.reduce((s, t) => s + (t.type === "income" ? t.amountCents : -t.amountCents), 0) / 100;

  const workoutsThisWeek = workouts.filter((w) => withinDays(w.date, today, 7)).length;

  const activeHabits = habits.filter((h) => h.active);
  const doneToday = activeHabits.filter((h) =>
    habitLogs.some((l) => l.habitId === h.id && l.date === today && l.completed)
  ).length;

  root.innerHTML = `
    <h1>Home</h1>
    <p class="subtitle" id="live-clock">${formatDateTime(new Date())}</p>

    ${heroFigure()}

    <h2>At a glance</h2>
    <div class="card-grid">
      <a href="#/health" class="card">
        <div class="module-name">Health</div>
        <div class="module-value">${latestWeight?.weightKg ? latestWeight.weightKg + " kg" : "—"}</div>
        <div class="module-hint">${latestWeight ? "as of " + latestWeight.date : "No entries yet"}</div>
      </a>
      <a href="#/workouts" class="card">
        <div class="module-name">Workouts</div>
        <div class="module-value">${workoutsThisWeek}</div>
        <div class="module-hint">sessions this week</div>
      </a>
      <a href="#/finance" class="card">
        <div class="module-name">Finance</div>
        <div class="module-value ${net >= 0 ? "positive" : "negative"}">${net.toLocaleString(undefined, { style: "currency", currency: "USD" })}</div>
        <div class="module-hint">net, all time</div>
      </a>
      <a href="#/habits" class="card">
        <div class="module-name">Habits</div>
        <div class="module-value">${doneToday} / ${activeHabits.length}</div>
        <div class="module-hint">done today</div>
      </a>
    </div>

    <h2>Getting started</h2>
    <p class="empty-state">
      Pick a module from the sidebar to log your first entry. Everything is saved locally
      in this browser via IndexedDB — nothing leaves your machine.
    </p>
  `;

  startLiveClock(root);
}

// Updates the #live-clock element once a second, reading the device's own
// clock each time. Self-stops once the element is gone (e.g. the person
// has navigated to a different module), so it never leaks intervals.
function startLiveClock(root: HTMLElement) {
  let intervalId: number;

  const tick = () => {
    const el = root.querySelector("#live-clock");
    if (!el) {
      window.clearInterval(intervalId);
      return;
    }
    el.textContent = formatDateTime(new Date());
  };

  intervalId = window.setInterval(tick, 1000);
}

// A geometric human figure (head, torso, arms, legs — all simple shapes,
// no illustration) with four clickable module nodes arranged around it.
// Each node is an SVG <a> so it works with the existing hash router with
// no extra JS: clicking navigates straight to #/health etc.
function heroFigure(): string {
  return `
    <div class="hero-figure">
      <svg viewBox="0 0 480 600" role="img" aria-label="Navigate to a module">
        <!-- connecting hairlines from figure to each node -->
        <line x1="200" y1="160" x2="120" y2="150" class="hero-link" />
        <line x1="280" y1="160" x2="360" y2="150" class="hero-link" />
        <line x1="205" y1="320" x2="120" y2="410" class="hero-link" />
        <line x1="275" y1="320" x2="360" y2="410" class="hero-link" />

        <!-- figure: geometric, not illustrative -->
        <g class="figure">
          <circle cx="240" cy="88" r="34" />
          <path d="M185,130 L295,130 L275,290 L205,290 Z" />
          <rect x="150" y="140" width="26" height="130" rx="13" />
          <rect x="304" y="140" width="26" height="130" rx="13" />
          <rect x="206" y="290" width="28" height="215" rx="10" />
          <rect x="246" y="290" width="28" height="215" rx="10" />
          <rect x="200" y="500" width="40" height="16" rx="6" />
          <rect x="240" y="500" width="40" height="16" rx="6" />
        </g>

        <!-- Health -->
        <a href="#/health" class="module-node" aria-label="Health">
          <circle cx="90" cy="150" r="46" />
          <rect x="76" y="140" width="9" height="24" rx="2" />
          <rect x="66" y="150" width="29" height="9" rx="2" />
          <text x="90" y="216" text-anchor="middle">Health</text>
        </a>

        <!-- Workouts -->
        <a href="#/workouts" class="module-node" aria-label="Workouts">
          <circle cx="390" cy="150" r="46" />
          <circle cx="375" cy="150" r="10" />
          <circle cx="405" cy="150" r="10" />
          <rect x="379" y="147" width="22" height="6" rx="2" />
          <text x="390" y="216" text-anchor="middle">Workouts</text>
        </a>

        <!-- Finance -->
        <a href="#/finance" class="module-node" aria-label="Finance">
          <circle cx="90" cy="430" r="46" />
          <text x="90" y="440" text-anchor="middle" class="node-glyph">$</text>
          <text x="90" y="496" text-anchor="middle">Finance</text>
        </a>

        <!-- Habits -->
        <a href="#/habits" class="module-node" aria-label="Habits">
          <circle cx="390" cy="430" r="46" />
          <polyline points="378,430 387,440 404,418" />
          <text x="390" y="496" text-anchor="middle">Habits</text>
        </a>
      </svg>
    </div>
  `;
}

function withinDays(dateStr: string, todayStr: string, days: number): boolean {
  const date = new Date(dateStr).getTime();
  const today = new Date(todayStr).getTime();
  const diff = (today - date) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < days;
}
