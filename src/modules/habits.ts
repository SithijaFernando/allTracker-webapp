import { add, getAll, remove, STORES } from "../storage/db";
import type { Habit, HabitLog } from "../types";
import { todayIso } from "../utils/date";

export async function renderHabits(root: HTMLElement) {
  const habits = (await getAll<Habit>(STORES.habits)).filter((h) => h.active);
  const logs = await getAll<HabitLog>(STORES.habitLogs);
  const today = todayIso();

  root.innerHTML = `
    <h1>Habits</h1>
    <p class="subtitle">Daily check-ins. Tap a habit to mark it done for today.</p>

    <form class="entry-form" id="habit-form">
      <div class="field" style="grid-column: span 2;">
        <label for="new-habit">New habit</label>
        <input type="text" id="new-habit" placeholder="e.g. Drink 2L water" required />
      </div>
      <button type="submit">Add habit</button>
    </form>

    <h2>Today — ${today}</h2>
    ${habits.length === 0 ? `<p class="empty-state">No habits yet. Add one above.</p>` : habitList(habits, logs, today)}
  `;

  document.getElementById("habit-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("new-habit") as HTMLInputElement;
    const name = input.value.trim();
    if (!name) return;

    await add<Habit>(STORES.habits, {
      name,
      createdAt: today,
      active: true,
    });

    renderHabits(root);
  });

  root.querySelectorAll<HTMLButtonElement>("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const habitId = btn.dataset.toggle!;
      const existing = logs.find((l) => l.habitId === habitId && l.date === today);

      if (existing) {
        await remove(STORES.habitLogs, existing.id);
      } else {
        await add<HabitLog>(STORES.habitLogs, { habitId, date: today, completed: true });
      }
      renderHabits(root);
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const habit = habits.find((h) => h.id === btn.dataset.delete);
      if (habit) await remove(STORES.habits, habit.id);
      renderHabits(root);
    });
  });
}

function habitList(habits: Habit[], logs: HabitLog[], today: string): string {
  const rows = habits
    .map((h) => {
      const done = logs.some((l) => l.habitId === h.id && l.date === today);
      const streak = computeStreak(h.id, logs, today);
      return `
        <tr>
          <td class="text">${h.name}</td>
          <td>${streak} day${streak === 1 ? "" : "s"}</td>
          <td>
            <button class="${done ? "" : "ghost"}" data-toggle="${h.id}">
              ${done ? "Done today" : "Mark done"}
            </button>
          </td>
          <td><button class="ghost" data-delete="${h.id}">Remove</button></td>
        </tr>`;
    })
    .join("");

  return `
    <table>
      <thead>
        <tr><th>Habit</th><th>Streak</th><th></th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function computeStreak(habitId: string, logs: HabitLog[], today: string): number {
  const completedDates = new Set(
    logs.filter((l) => l.habitId === habitId && l.completed).map((l) => l.date)
  );

  let streak = 0;
  const cursor = new Date(today);

  while (completedDates.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
