export const workoutPlan = {
  id: "planB",
  title: "Plan B - Recomposition (5 Day Split)",
  warmUp: [
    { name: "5-10 Min Cross Trainer" },
    { name: "5 Min Dynamic Stretching" },
    { name: "Push-ups (Light)", sets: 1, reps: 10 },
    { name: "Bodyweight Squats", sets: 1, reps: 10 },
  ],
  days: {
    monday: [
      { name: "Machine Chest Press", sets: 4, reps: "8-12" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "8-12" },
      { name: "Machine Shoulder Press", sets: 3, reps: "8-12" },
      { name: "Dumbbell Lateral Raises", sets: 3, reps: "12-15" },
      { name: "Tricep Pushdown", sets: 3, reps: "10-12" },
      { name: "Push-ups", sets: 2, reps: "Failure" },
    ],

    tuesday: [
      { name: "Lat Pulldown", sets: 4, reps: "8-12" },
      { name: "Seated Row", sets: 3, reps: "8-12" },
      { name: "Bodyweight Rows / Assisted Pull-ups", sets: 3, reps: "6-10" },
      { name: "Face Pulls", sets: 3, reps: "12-15" },
      { name: "Dumbbell Bicep Curls", sets: 3, reps: "10-12" },
      { name: "Hammer Curls", sets: 2, reps: "10-12" },
    ],

    wednesday: [
      { name: "Squats / Leg Press", sets: 4, reps: "8-12" },
      { name: "Romanian Deadlift", sets: 3, reps: "8-12" },
      { name: "Leg Curl (Hamstrings)", sets: 3, reps: "10-12" },
      { name: "Walking Lunges", sets: 3, reps: "10/leg" },
      { name: "Standing Calf Raises", sets: 4, reps: "12-15" },

      // Core
      { name: "Plank", sets: 3, reps: "30-60 sec" },
      { name: "Leg Raises", sets: 3, reps: "12-15" },
    ],

    thursday: [
      { name: "Incline Chest Press", sets: 3, reps: "8-12" },
      { name: "Lat Pulldown", sets: 3, reps: "8-12" },
      { name: "Seated Row", sets: 3, reps: "8-12" },
      { name: "Rear Delt Fly", sets: 3, reps: "12-15" },
      { name: "Tricep Dips", sets: 3, reps: "8-12" },
      { name: "Bicep Curl (Any)", sets: 3, reps: "10-12" },
    ],

    friday: [
      { name: "Treadmill / Cycling", sets: 1, reps: "10-15 min" },

      // Core Circuit
      { name: "Hanging Leg Raises", sets: 3, reps: "12-15" },
      { name: "Russian Twists", sets: 3, reps: "20" },
      { name: "Mountain Climbers", sets: 3, reps: "20" },
      { name: "Plank", sets: 3, reps: "45 sec" },

      // Optional Finisher
      { name: "Battle Ropes / HIIT", sets: 1, reps: "5-10 min" },
    ],

    saturday: [
      { name: "Rest / Light Walking", sets: 1, reps: "20-30 min" },
    ],

    sunday: [
      { name: "Full Body Stretching", sets: 1, reps: "15-20 min" },
      { name: "Cat-Camel Stretch", sets: 2, reps: "10" },
      { name: "Bird-Dog", sets: 2, reps: "10/side" },
      { name: "Lower Back Stretch", sets: 2, reps: "30 sec" },
    ],
  },
};