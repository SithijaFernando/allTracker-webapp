import { registerRoute, startRouter } from "./router";
import { renderDashboard } from "./dashboard";
import { renderHealth } from "./modules/health";
import { renderWorkouts } from "./modules/workouts";
import { renderFinance } from "./modules/finance";
import { renderHabits } from "./modules/habits";

const content = document.getElementById("content")!;

registerRoute("/", () => renderDashboard(content));
registerRoute("/health", () => renderHealth(content));
registerRoute("/workouts", () => renderWorkouts(content));
registerRoute("/finance", () => renderFinance(content));
registerRoute("/habits", () => renderHabits(content));

startRouter();
