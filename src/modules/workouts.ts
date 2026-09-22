import { add, getAll, remove, STORES } from "../storage/db";
import type { Workout } from "../types";
import { todayIso } from "../utils/date";

export async function renderWorkouts(root: HTMLElement) {
  const entries = (await getAll<Workout>(STORES.workouts)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  root.innerHTML = `
    <h1>Workouts</h1>
    <p class="subtitle">Log sessions by type and duration.</p>

    <form class="entry-form" id="workout-form">
      <div class="field">
        <label for="w-date">Date</label>
        <input type="date" id="w-date" value="${todayIso()}" required />
      </div>
      <div class="field">
        <label for="w-type">Type</label>
        <select id="w-type">
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="yoga">Yoga</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div class="field">
        <label for="w-duration">Duration (min)</label>
        <input type="number" id="w-duration" min="0" required />
      </div>
      <div class="field">
        <label for="w-notes">Notes</label>
        <input type="text" id="w-notes" placeholder="optional" />
      </div>
      <button type="submit">Log workout</button>
    </form>

    <h2>Log</h2>
    ${entries.length === 0 ? emptyState() : entryTable(entries)}
  `;

  document.getElementById("workout-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = (document.getElementById("w-date") as HTMLInputElement).value;
    const type = (document.getElementById("w-type") as HTMLSelectElement).value as Workout["type"];
    const durationMin = Number((document.getElementById("w-duration") as HTMLInputElement).value);
    const notes = (document.getElementById("w-notes") as HTMLInputElement).value;

    await add<Workout>(STORES.workouts, {
      date,
      type,
      durationMin,
      notes: notes || undefined,
    });

    renderWorkouts(root);
  });

  root.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await remove(STORES.workouts, btn.dataset.delete!);
      renderWorkouts(root);
    });
  });
}

function emptyState(): string {
  return `<p class="empty-state">No workouts logged yet.</p>`;
}

function entryTable(entries: Workout[]): string {
  const rows = entries
    .map(
      (e) => `
      <tr>
        <td>${e.date}</td>
        <td class="text">${e.type}</td>
        <td>${e.durationMin} min</td>
        <td class="text">${e.notes ?? ""}</td>
        <td><button class="ghost" data-delete="${e.id}">Delete</button></td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead>
        <tr><th>Date</th><th>Type</th><th>Duration</th><th>Notes</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
