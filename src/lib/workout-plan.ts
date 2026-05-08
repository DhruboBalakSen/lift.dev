export const workoutPlan = {
  id: "planC",
  title: "Plan C - Beginner Recomposition (5 Day Split)",

  warmUp: [
    { name: "5-10 Min Incline Walk / Cross Trainer" },
    { name: "Dynamic Stretching", sets: 1, reps: "5 min" },
    { name: "Arm Circles", sets: 1, reps: "20" },
    { name: "Bodyweight Squats", sets: 1, reps: "15" },
  ],

  days: {
    monday: [
      { name: "Bench Press", sets: 4, reps: "8" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10" },
      { name: "Shoulder Press", sets: 3, reps: "10" },
      { name: "Lateral Raises", sets: 3, reps: "15" },
      { name: "Tricep Pushdowns", sets: 3, reps: "12" },
      { name: "Pushups", sets: 2, reps: "Failure" },
    ],

    tuesday: [
      { name: "Lat Pulldown", sets: 4, reps: "10" },
      { name: "Seated Cable Row", sets: 3, reps: "10" },
      { name: "Dumbbell Rows", sets: 3, reps: "12" },
      { name: "Face Pulls", sets: 3, reps: "15" },
      { name: "Barbell / Dumbbell Curls", sets: 3, reps: "12" },
      { name: "Hammer Curls", sets: 3, reps: "12" },
    ],

    wednesday: [
      { name: "Squats", sets: 4, reps: "8" },
      { name: "Leg Press", sets: 3, reps: "12" },
      { name: "Romanian Deadlift", sets: 3, reps: "10" },
      { name: "Leg Curl", sets: 3, reps: "12" },
      { name: "Calf Raises", sets: 4, reps: "15" },

      // Core
      { name: "Plank", sets: 3, reps: "45 sec" },
      { name: "Hanging Leg Raises", sets: 3, reps: "12" },
    ],

    thursday: [
      { name: "Incline Bench Press", sets: 3, reps: "10" },
      { name: "Pullups / Assisted Pullups", sets: 3, reps: "Failure" },
      { name: "Chest Supported Rows", sets: 3, reps: "10" },
      { name: "Arnold Press", sets: 3, reps: "12" },
      { name: "Cable Flys", sets: 3, reps: "15" },
      { name: "Bicep + Tricep Superset", sets: 3, reps: "Rounds" },
    ],

    friday: [
      { name: "Incline Treadmill Walk", sets: 1, reps: "15-20 min" },
      { name: "Farmer's Walk", sets: 3, reps: "30-40 sec" },
      { name: "Battle Ropes OR Cycling", sets: 1, reps: "10-15 min" },

      // Core Circuit
      { name: "Plank", sets: 3, reps: "45 sec" },
      { name: "Mountain Climbers", sets: 3, reps: "20" },
      { name: "Russian Twists", sets: 3, reps: "20" },

      // Weak Point Training
      { name: "Extra Shoulder Work", sets: 2, reps: "12-15" },
      { name: "Extra Chest Work", sets: 2, reps: "12-15" },
      { name: "Extra Back Work", sets: 2, reps: "12-15" },
    ],

    saturday: [
      { name: "Rest Day", sets: 1, reps: "Full Recovery" },
    ],

    sunday: [
      { name: "Active Recovery Walk", sets: 1, reps: "20-30 min" },
      { name: "Full Body Stretching", sets: 1, reps: "15-20 min" },
      { name: "Cat-Camel Stretch", sets: 2, reps: "10" },
      { name: "Bird-Dog", sets: 2, reps: "10/side" },
    ],
  },
};