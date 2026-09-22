// Core record types for allTracker.
// Dates are stored as ISO strings ("YYYY-MM-DD" or full ISO datetime).
// Money amounts are stored as integer cents to avoid float rounding issues.

export interface HealthEntry {
  id: string;
    date: string; // YYYY-MM-DD
      weightKg?: number;
        heightCm?: number;
          bodyFatPct?: number;
            notes?: string;
            }

            export interface ExerciseSet {
              reps: number;
                weightKg?: number;
                }

                export interface Exercise {
                  name: string;
                    sets: ExerciseSet[];
                    }

                    export interface Workout {
                      id: string;
                        date: string;
                          type: "strength" | "cardio" | "yoga" | "other";
                            durationMin: number;
                              notes?: string;
                              }

                              export interface Transaction {
                                id: string;
                                  date: string;
                                    amountCents: number; // always positive; sign is carried by `type`
                                      type: "income" | "expense";
                                        category: string;
                                          notes?: string;
                                          }

                                          export interface Habit {
                                            id: string;
                                              name: string;
                                                createdAt: string;
                                                  active: boolean;
                                                  }

                                                  export interface HabitLog {
                                                    id: string;
                                                      habitId: string;
                                                        date: string;
                                                          completed: boolean;
                                                          }

                                                          export type ModuleType = "health" | "workouts" | "finance" | "habits";
                                                          