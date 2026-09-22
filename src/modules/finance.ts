import { add, getAll, remove, STORES } from "../storage/db";
import type { Transaction } from "../types";
import { todayIso } from "../utils/date";

function formatCents(cents: number): string {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export async function renderFinance(root: HTMLElement) {
  const entries = (await getAll<Transaction>(STORES.transactions)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const income = entries.filter((e) => e.type === "income").reduce((s, e) => s + e.amountCents, 0);
  const expense = entries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amountCents, 0);
  const net = income - expense;

  root.innerHTML = `
    <h1>Finance</h1>
    <p class="subtitle">Income and expenses, all time.</p>

    <div class="card-grid">
      <div class="card">
        <div class="module-name">Income</div>
        <div class="module-value positive">${formatCents(income)}</div>
      </div>
      <div class="card">
        <div class="module-name">Expenses</div>
        <div class="module-value negative">${formatCents(expense)}</div>
      </div>
      <div class="card">
        <div class="module-name">Net</div>
        <div class="module-value ${net >= 0 ? "positive" : "negative"}">${formatCents(net)}</div>
      </div>
    </div>

    <form class="entry-form" id="tx-form">
      <div class="field">
        <label for="t-date">Date</label>
        <input type="date" id="t-date" value="${todayIso()}" required />
      </div>
      <div class="field">
        <label for="t-type">Type</label>
        <select id="t-type">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>
      <div class="field">
        <label for="t-amount">Amount</label>
        <input type="number" id="t-amount" step="0.01" min="0" required placeholder="0.00" />
      </div>
      <div class="field">
        <label for="t-category">Category</label>
        <input type="text" id="t-category" placeholder="e.g. groceries" required />
      </div>
      <div class="field">
        <label for="t-notes">Notes</label>
        <input type="text" id="t-notes" placeholder="optional" />
      </div>
      <button type="submit">Add transaction</button>
    </form>

    <h2>Transactions</h2>
    ${entries.length === 0 ? emptyState() : entryTable(entries)}
  `;

  document.getElementById("tx-form")!.addEventListener("submit", async (e) => {
    e.preventDefault();
    const date = (document.getElementById("t-date") as HTMLInputElement).value;
    const type = (document.getElementById("t-type") as HTMLSelectElement).value as Transaction["type"];
    const amount = Number((document.getElementById("t-amount") as HTMLInputElement).value);
    const category = (document.getElementById("t-category") as HTMLInputElement).value;
    const notes = (document.getElementById("t-notes") as HTMLInputElement).value;

    await add<Transaction>(STORES.transactions, {
      date,
      type,
      amountCents: Math.round(amount * 100),
      category,
      notes: notes || undefined,
    });

    renderFinance(root);
  });

  root.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await remove(STORES.transactions, btn.dataset.delete!);
      renderFinance(root);
    });
  });
}

function emptyState(): string {
  return `<p class="empty-state">No transactions yet.</p>`;
}

function entryTable(entries: Transaction[]): string {
  const rows = entries
    .map(
      (e) => `
      <tr>
        <td>${e.date}</td>
        <td class="text">${e.category}</td>
        <td class="${e.type === "income" ? "positive" : "negative"}">
          ${e.type === "income" ? "+" : "−"}${formatCents(e.amountCents)}
        </td>
        <td class="text">${e.notes ?? ""}</td>
        <td><button class="ghost" data-delete="${e.id}">Delete</button></td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead>
        <tr><th>Date</th><th>Category</th><th>Amount</th><th>Notes</th><th></th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
