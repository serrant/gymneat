import { slug } from '../lib/util.js';

export const GROUPS = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core', 'Full body', 'Cardio'];

// W = weight × reps, B = bodyweight reps, S = timed hold (seconds), C = cardio (minutes + km)
export const TYPE_LABEL = { W: 'Weight × reps', B: 'Bodyweight reps', S: 'Timed hold', C: 'Cardio' };

// Defaults when an exercise is added to a day. For S, `reps` is seconds; for C, minutes.
export const DEF = {
  W: { sets: 3, reps: 10, rest: 90 },
  B: { sets: 3, reps: 12, rest: 60 },
  S: { sets: 3, reps: 30, rest: 45 },
  C: { sets: 1, reps: 20, rest: 0 }
};

// Trend metrics per type: [key, label, unit]. The first one is the default.
export const METRICS = {
  W: [['top', 'Weight', 'kg']],
  B: [['maxr', 'Best set', 'reps'], ['totr', 'Total reps', 'reps']],
  S: [['maxs', 'Longest', 's'], ['tots', 'Total', 's']],
  C: [['dist', 'Distance', 'km'], ['time', 'Time', 'min'], ['spd', 'Speed', 'km/h']]
};

const LIB_RAW = {
  Chest: [['Bench press', 'W'], ['Incline bench press', 'W'], ['Decline bench press', 'W'], ['Dumbbell bench press', 'W'], ['Incline dumbbell press', 'W'], ['Chest press machine', 'W'], ['Pec deck', 'W'], ['Cable fly', 'W'], ['Dumbbell fly', 'W'], ['Push-ups', 'B'], ['Incline push-ups', 'B'], ['Chest dips', 'B']],
  Back: [['Pull-ups', 'B'], ['Chin-ups', 'B'], ['Weighted pull-ups', 'W'], ['Lat pulldown', 'W'], ['Close-grip pulldown', 'W'], ['Straight-arm pulldown', 'W'], ['Seated cable row', 'W'], ['Barbell row', 'W'], ['Dumbbell row', 'W'], ['T-bar row', 'W'], ['Machine row', 'W'], ['Deadlift', 'W'], ['Back extension', 'B'], ['Shrugs', 'W']],
  Shoulders: [['Overhead press', 'W'], ['Dumbbell shoulder press', 'W'], ['Shoulder press machine', 'W'], ['Arnold press', 'W'], ['Lateral raise', 'W'], ['Cable lateral raise', 'W'], ['Front raise', 'W'], ['Rear delt fly', 'W'], ['Face pull', 'W'], ['Upright row', 'W']],
  Biceps: [['Barbell curl', 'W'], ['EZ-bar curl', 'W'], ['Dumbbell curl', 'W'], ['Hammer curl', 'W'], ['Incline dumbbell curl', 'W'], ['Preacher curl', 'W'], ['Cable curl', 'W'], ['Concentration curl', 'W']],
  Triceps: [['Triceps pushdown', 'W'], ['Rope pushdown', 'W'], ['Overhead triceps extension', 'W'], ['Skull crushers', 'W'], ['Close-grip bench press', 'W'], ['Triceps kickback', 'W'], ['Dips', 'B'], ['Bench dips', 'B']],
  Legs: [['Squat', 'W'], ['Front squat', 'W'], ['Goblet squat', 'W'], ['Leg press', 'W'], ['Hack squat', 'W'], ['Romanian deadlift', 'W'], ['Lunges', 'W'], ['Bulgarian split squat', 'W'], ['Step-ups', 'W'], ['Leg extension', 'W'], ['Lying leg curl', 'W'], ['Seated leg curl', 'W'], ['Hip thrust', 'W'], ['Hip abduction', 'W'], ['Hip adduction', 'W'], ['Standing calf raise', 'W'], ['Seated calf raise', 'W']],
  Core: [['Crunches', 'B'], ['Sit-ups', 'B'], ['Bicycle crunch', 'B'], ['Leg raises', 'B'], ['Hanging leg raise', 'B'], ['Russian twist', 'B'], ['Ab wheel rollout', 'B'], ['Dead bug', 'B'], ['Cable crunch', 'W'], ['Ab crunch machine', 'W'], ['Plank', 'S'], ['Side plank', 'S'], ['Hollow hold', 'S']],
  'Full body': [['Kettlebell swing', 'W'], ['Thrusters', 'W'], ['Power clean', 'W'], ["Farmer's carry", 'W'], ['Burpees', 'B'], ['Mountain climbers', 'B'], ['Battle ropes', 'S']],
  Cardio: [['Treadmill run', 'C'], ['Outdoor run', 'C'], ['Walking', 'C'], ['Incline walk', 'C'], ['Stair climber', 'C'], ['Stationary bike', 'C'], ['Rowing machine', 'C'], ['Elliptical', 'C'], ['Jump rope', 'C'], ['Swimming', 'C']]
};

// Built-in exercises keyed by id (the slug of the name). Ids are stored in plans and sessions: never rename one.
export const LIB = {};
export const LIB_LIST = [];
for (const g in LIB_RAW) {
  for (const [name, t] of LIB_RAW[g]) {
    const id = slug(name);
    LIB[id] = { id, name, g, t };
    LIB_LIST.push(LIB[id]);
  }
}
