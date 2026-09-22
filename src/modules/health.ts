import { add, getAll, remove, STORES } from "../storage/db";
import type { HealthEntry } from "../types";
import { todayIso } from "../utils/date";

export async function renderHealth(root: HTMLElement) {
  const entries = (await getAll<HealthEntry>(STORES.health)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  root.innerHTML = `
    <h1>Health</h1>
    <p class="subtitle">Weight and body measurements over time.</p>

    <form class="entry-form" id="health-form">
      <div class="field">
        <label for="h-date">Date</label>
        <input type="date" id="h-date" value="${todayIso()}" required />
      </div>
      <div class="field">
        <label for="h-weight">Weight (kg)</label>
        <input type="number" id="h-weight" step="0.1" placeholder="e.g. 72.5" />
      </div>
      <div class="field">
        <label for="h-bf">Body fat %</label>
        <input type="number" id="h-bf" step="0.1" placeholder="optional" />
      </div>
      <div class="field">
        <label for="h-notes">Notes</label>
        <input type="text" id="h-notes" placeholder="optional" />
      </div>
      <button type="submit">Log entry</button>
    </form>

    <h2>Log</h2>
    ${entries.length === 0 ? emptyState() : entryTable(entries)}
  `;

  document.getElementById("health-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = (document.getElementById("h-date") as HTMLInputElement).value;
    const weightVal = (document.getElementById("h-weight") as HTMLInputElement).value;
    const bfVal = (document.getElementById("h-bf") as HTMLInputElement).value;
    const notes = (document.getElementById("h-notes") as HTMLInputElement).value;

    await add<HealthEntry>(STORES.health, {
      date,
      weightKg: weightVal ? Number(weightVal) : undefined,
      bodyFatPct: bfVal ? Number(bfVal) : undefined,
      notes: notes || undefined,
    });

    renderHealth(root);
  });

  root.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await remove(STORES.health, btn.dataset.delete!);
      renderHealth(root);
    });
  });
}

function emptyState(): string {
  return `<p class="empty-state">No entries yet. Log your first one above.</p>`;
}

function entryTable(entries: HealthEntry[]): string {
  const rows = entries
    .map(
      (e) => `
      <tr>
        <td>${e.date}</td>
        <td>${e.weightKg ?? "—"}</td>
        <td>${e.bodyFatPct ?? "—"}</td>
        <td class="text">${e.notes ?? ""}</td>
        <td><button class="ghost" data-delete="${e.id}">Delete</button></td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead>
        <tr><th>Date</th><th>Weight (kg)</th><th>Body fat %</th><th>Notes</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
