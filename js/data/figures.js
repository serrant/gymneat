// Minimal 2D exercise figures: one pair of poses (start A, end B) per movement family.
// Coordinates are in a 120 × 110 box (x 0–120, y −10–100), the floor at y = 92, facing right.
// Joints: h head, n shoulders, p hips, e/w elbow/hand, k/f knee/foot. e2 w2 k2 f2 = far-side limbs (drawn faded).
// Equipment: line (static), circle (static), plate / db / kb / grip / pad (drawn at a joint, so it moves),
// cable (from a joint to a fixed pulley).

const STAND = { h: [60, 16], n: [60, 27], p: [60, 53], e: [60, 40], w: [61, 52], k: [60, 72], f: [60, 92] };
const st = o => Object.assign({}, STAND, o);

// lying face up on a flat bench (head left)
const LIE = { h: [27, 71], n: [37, 73], p: [63, 74], k: [80, 72], f: [86, 92] };
const BENCH = [{ t: 'line', a: [22, 78], b: [88, 78], w: 5 }, { t: 'line', a: [28, 78], b: [28, 92] }, { t: 'line', a: [82, 78], b: [82, 92] }];
// seated upright on a machine seat
const SEAT = { h: [44, 29], n: [44, 40], p: [46, 66], k: [64, 66], f: [66, 86] };
const SEAT_EQ = [{ t: 'line', a: [36, 70], b: [62, 70], w: 5 }, { t: 'line', a: [36, 70], b: [34, 38], w: 5 }, { t: 'line', a: [48, 70], b: [48, 92] }];
// hip hinge (bent over), used by rows and kickbacks
const HINGE = { h: [80, 35], n: [70, 40], p: [46, 52], k: [56, 72], f: [52, 92] };
const BAR = [{ t: 'line', a: [40, 12], b: [82, 12], w: 4 }];

export const FAMILIES = {
  bench: { eq: BENCH, A: { ...LIE, e: [46, 83], w: [44, 70] }, B: { ...LIE, e: [39, 60], w: [41, 47] }, tool: 'plate' },
  benchIncline: {
    eq: [{ t: 'line', a: [34, 54], b: [64, 80], w: 5 }, { t: 'line', a: [64, 80], b: [86, 80], w: 5 }, { t: 'line', a: [72, 80], b: [72, 92] }],
    A: { h: [36, 47], n: [44, 56], p: [64, 76], k: [82, 76], f: [86, 92], e: [55, 64], w: [51, 53] },
    B: { h: [36, 47], n: [44, 56], p: [64, 76], k: [82, 76], f: [86, 92], e: [50, 44], w: [57, 33] }, tool: 'plate'
  },
  fly: { eq: BENCH, A: { ...LIE, e: [44, 84], w: [52, 90] }, B: { ...LIE, e: [40, 61], w: [43, 49] }, tool: 'db' },
  chestPress: { eq: SEAT_EQ, A: { ...SEAT, e: [52, 52], w: [62, 45] }, B: { ...SEAT, e: [56, 42], w: [69, 41] }, tool: 'grip' },
  pushup: {
    A: { f: [22, 90], k: [38, 87], p: [53, 84], n: [80, 78], h: [90, 75], e: [72, 86], w: [80, 92] },
    B: { f: [22, 90], k: [38, 82], p: [53, 75], n: [80, 62], h: [90, 58], e: [80, 77], w: [80, 92] }
  },
  dips: {
    eq: [{ t: 'line', a: [52, 50], b: [74, 50], w: 4 }, { t: 'line', a: [70, 50], b: [70, 92] }],
    A: { h: [61, 31], n: [60, 42], p: [58, 66], e: [50, 50], w: [62, 50], k: [58, 84], f: [46, 82] },
    B: { h: [61, 19], n: [60, 30], p: [58, 54], e: [61, 40], w: [62, 50], k: [58, 72], f: [46, 70] }
  },
  pullup: {
    eq: BAR, floor: false,
    A: { h: [59, 25], n: [60, 36], p: [60, 62], e: [62, 24], w: [64, 12], k: [61, 80], f: [57, 98] },
    B: { h: [60, 6], n: [60, 17], p: [60, 43], e: [55, 26], w: [64, 12], k: [61, 61], f: [57, 79] }
  },
  pulldown: {
    eq: [...SEAT_EQ.slice(0, 1), { t: 'line', a: [48, 70], b: [48, 92] }, { t: 'line', a: [60, 64], b: [72, 64], w: 4 }],
    A: { h: [52, 29], n: [52, 40], p: [52, 66], k: [70, 66], f: [70, 86], e: [54, 27], w: [56, 14] },
    B: { h: [52, 29], n: [52, 40], p: [52, 66], k: [70, 66], f: [70, 86], e: [46, 51], w: [56, 41] },
    cable: [58, -6], tool: 'grip'
  },
  straightArm: {
    A: { h: [58, 17], n: [56, 28], p: [52, 54], k: [54, 72], f: [52, 92], e: [66, 22], w: [76, 17] },
    B: { h: [58, 17], n: [56, 28], p: [52, 54], k: [54, 72], f: [52, 92], e: [60, 40], w: [62, 52] },
    cable: [96, -4], tool: 'grip'
  },
  cableRow: {
    eq: [{ t: 'line', a: [28, 74], b: [52, 74], w: 5 }, { t: 'line', a: [84, 68], b: [84, 88], w: 4 }],
    A: { h: [45, 33], n: [44, 44], p: [40, 70], k: [62, 58], f: [80, 78], e: [56, 46], w: [68, 48] },
    B: { h: [45, 33], n: [44, 44], p: [40, 70], k: [62, 58], f: [80, 78], e: [34, 50], w: [46, 54] },
    cable: [96, 60], tool: 'grip'
  },
  bentRow: { A: { ...HINGE, e: [70, 53], w: [70, 66] }, B: { ...HINGE, e: [60, 46], w: [64, 57] }, tool: 'plate' },
  deadlift: {
    A: { h: [72, 52], n: [62, 58], p: [37, 64], e: [62, 70], w: [62, 82], k: [54, 76], f: [56, 92] },
    B: st({ w: [61, 54], e: [60, 41] }), tool: 'plate'
  },
  rdl: {
    A: { h: [76, 42], n: [67, 47], p: [44, 54], e: [67, 60], w: [67, 72], k: [56, 73], f: [54, 92] },
    B: st({ w: [61, 54], e: [60, 41] }), tool: 'plate'
  },
  shrug: { A: st({ e: [62, 40], w: [63, 52] }), B: st({ n: [60, 20], e: [62, 33], w: [63, 45] }), tool: 'db' },
  backExt: {
    floor: false,
    eq: [{ t: 'line', a: [40, 78], b: [62, 70], w: 5 }, { t: 'line', a: [20, 90], b: [30, 90], w: 5 }, { t: 'line', a: [50, 75], b: [50, 92] }],
    A: { f: [24, 88], k: [36, 81], p: [52, 70], n: [64, 90], h: [70, 99], e: [70, 82], w: [74, 76] },
    B: { f: [24, 88], k: [36, 81], p: [52, 70], n: [76, 60], h: [86, 55], e: [70, 66], w: [76, 64] }
  },
  ohp: { A: st({ e: [64, 38], w: [66, 26] }), B: st({ e: [61, 14], w: [62, 1] }), tool: 'plate' },
  latRaise: {
    front: true,
    A: { h: [60, 16], n: [60, 27], p: [60, 53], e: [55, 40], w: [53, 52], e2: [65, 40], w2: [67, 52], k: [56, 72], f: [55, 92], k2: [64, 72], f2: [65, 92] },
    B: { h: [60, 16], n: [60, 27], p: [60, 53], e: [47, 28], w: [35, 28], e2: [73, 28], w2: [85, 28], k: [56, 72], f: [55, 92], k2: [64, 72], f2: [65, 92] },
    tool: 'db'
  },
  frontRaise: { A: st({}), B: st({ e: [73, 27], w: [85, 27] }), tool: 'db' },
  rearFly: { A: { ...HINGE, e: [70, 53], w: [71, 66] }, B: { ...HINGE, e: [66, 29], w: [62, 18] }, tool: 'db' },
  facePull: { A: st({ e: [72, 27], w: [84, 27] }), B: st({ e: [50, 24], w: [60, 18] }), cable: [104, 27], tool: 'grip' },
  uprightRow: { A: st({}), B: st({ e: [50, 22], w: [60, 33] }), tool: 'plate' },
  curl: { A: st({}), B: st({ w: [70, 31] }), tool: 'db' },
  cableCurl: { A: st({}), B: st({ w: [70, 31] }), cable: [76, 90], tool: 'grip' },
  pushdown: { A: st({ e: [61, 40], w: [72, 32] }), B: st({ e: [61, 40], w: [66, 52] }), cable: [78, -6], tool: 'grip' },
  overheadExt: { A: st({ e: [61, 14], w: [53, 22] }), B: st({ e: [61, 14], w: [62, 1] }), tool: 'db' },
  skull: { eq: BENCH, A: { ...LIE, e: [38, 60], w: [29, 66] }, B: { ...LIE, e: [38, 60], w: [39, 47] }, tool: 'plate' },
  kickback: { A: { ...HINGE, e: [58, 40], w: [58, 52] }, B: { ...HINGE, e: [58, 40], w: [46, 38] }, tool: 'db' },
  squat: {
    A: st({ e: [50, 33], w: [57, 24] }),
    B: { h: [67, 37], n: [64, 48], p: [54, 72], k: [72, 78], f: [60, 92], e: [54, 54], w: [61, 45] }, tool: 'plate'
  },
  frontSquat: {
    A: st({ e: [62, 39], w: [69, 28] }),
    B: { h: [64, 37], n: [62, 48], p: [52, 72], k: [70, 78], f: [60, 92], e: [64, 60], w: [71, 49] }, tool: 'plate'
  },
  gobletSquat: {
    A: st({ e: [62, 39], w: [66, 32] }),
    B: { h: [64, 37], n: [62, 48], p: [52, 72], k: [70, 78], f: [60, 92], e: [64, 60], w: [68, 52] }, tool: 'db'
  },
  legPress: {
    eq: [{ t: 'line', a: [22, 60], b: [44, 88], w: 5 }, { t: 'line', a: [44, 88], b: [62, 88], w: 5 }],
    A: { h: [27, 55], n: [33, 64], p: [50, 84], k: [62, 62], f: [80, 70], e: [42, 76], w: [52, 82] },
    B: { h: [27, 55], n: [33, 64], p: [50, 84], k: [70, 70], f: [90, 60], e: [42, 76], w: [52, 82] }, tool: 'plateV'
  },
  lunge: {
    A: { h: [58, 16], n: [58, 27], p: [58, 53], e: [58, 40], w: [59, 52], k: [62, 72], f: [64, 92], k2: [54, 72], f2: [50, 92] },
    B: { h: [58, 29], n: [58, 40], p: [58, 66], e: [58, 53], w: [59, 65], k: [74, 74], f: [74, 92], k2: [48, 86], f2: [36, 90] }, tool: 'db'
  },
  splitSquat: {
    eq: [{ t: 'line', a: [16, 72], b: [36, 72], w: 5 }, { t: 'line', a: [26, 72], b: [26, 92] }],
    A: { h: [62, 18], n: [62, 29], p: [60, 55], e: [62, 42], w: [63, 54], k: [70, 73], f: [72, 92], k2: [46, 70], f2: [30, 70] },
    B: { h: [64, 30], n: [64, 41], p: [60, 66], e: [64, 54], w: [65, 66], k: [78, 76], f: [76, 92], k2: [44, 84], f2: [30, 70] }, tool: 'db'
  },
  stepUp: {
    eq: [{ t: 'line', a: [64, 78], b: [96, 78], w: 4 }, { t: 'line', a: [64, 78], b: [64, 92], w: 4 }, { t: 'line', a: [96, 78], b: [96, 92], w: 4 }],
    A: { h: [56, 18], n: [56, 29], p: [56, 55], e: [56, 42], w: [57, 54], k: [72, 62], f: [74, 78], k2: [56, 74], f2: [56, 92] },
    B: { h: [76, 4], n: [76, 15], p: [76, 41], e: [76, 28], w: [77, 40], k: [77, 60], f: [76, 78], k2: [70, 58], f2: [66, 74] }, tool: 'db'
  },
  legExt: { eq: SEAT_EQ, A: { ...SEAT, e: [44, 52], w: [50, 62], f: [66, 86] }, B: { ...SEAT, e: [44, 52], w: [50, 62], f: [84, 62] }, tool: 'padF' },
  legCurl: {
    eq: [{ t: 'line', a: [20, 76], b: [88, 76], w: 5 }, { t: 'line', a: [30, 76], b: [30, 92] }, { t: 'line', a: [80, 76], b: [80, 92] }],
    A: { h: [25, 64], n: [35, 69], p: [58, 71], k: [76, 71], f: [95, 71], e: [26, 78], w: [20, 72] },
    B: { h: [25, 64], n: [35, 69], p: [58, 71], k: [76, 71], f: [82, 53], e: [26, 78], w: [20, 72] }, tool: 'padF'
  },
  seatedLegCurl: { eq: SEAT_EQ, A: { ...SEAT, e: [44, 52], w: [50, 62], f: [84, 62] }, B: { ...SEAT, e: [44, 52], w: [50, 62], f: [62, 84] }, tool: 'padF' },
  hipThrust: {
    eq: [{ t: 'line', a: [14, 62], b: [34, 62], w: 5 }, { t: 'line', a: [24, 62], b: [24, 92] }],
    A: { h: [24, 54], n: [32, 60], p: [50, 84], k: [64, 72], f: [70, 92], e: [42, 72], w: [50, 78] },
    B: { h: [24, 54], n: [32, 60], p: [54, 62], k: [70, 68], f: [72, 92], e: [44, 54], w: [54, 56] }, tool: 'plateP'
  },
  abduction: {
    front: true, eq: [{ t: 'line', a: [42, 64], b: [78, 64], w: 5 }],
    A: { h: [60, 22], n: [60, 33], p: [60, 60], e: [54, 46], w: [50, 58], e2: [66, 46], w2: [70, 58], k: [55, 72], f: [55, 90], k2: [65, 72], f2: [65, 90] },
    B: { h: [60, 22], n: [60, 33], p: [60, 60], e: [54, 46], w: [50, 58], e2: [66, 46], w2: [70, 58], k: [42, 72], f: [44, 90], k2: [78, 72], f2: [76, 90] }, tool: 'padK'
  },
  calfRaise: { A: st({}), B: st({ h: [60, 10], n: [60, 21], p: [60, 47], e: [60, 34], w: [61, 46], k: [60, 66], f: [60, 86] }), tool: 'db' },
  seatedCalf: {
    eq: SEAT_EQ, A: { ...SEAT, e: [52, 54], w: [62, 62], k: [64, 66], f: [66, 86] },
    B: { ...SEAT, e: [52, 50], w: [62, 58], k: [64, 62], f: [66, 84] }, tool: 'padK'
  },
  crunch: {
    A: { h: [24, 82], n: [34, 84], p: [58, 86], k: [72, 70], f: [84, 90], e: [42, 78], w: [36, 80] },
    B: { h: [28, 66], n: [36, 73], p: [58, 86], k: [72, 70], f: [84, 90], e: [45, 72], w: [40, 68] }
  },
  situp: {
    A: { h: [24, 82], n: [34, 84], p: [58, 86], k: [72, 70], f: [84, 90], e: [30, 76], w: [24, 74] },
    B: { h: [47, 50], n: [50, 61], p: [58, 86], k: [72, 70], f: [84, 90], e: [44, 56], w: [42, 48] }
  },
  bicycle: {
    A: { h: [28, 70], n: [36, 76], p: [58, 86], k: [66, 66], f: [80, 72], k2: [76, 82], f2: [95, 80], e: [32, 66], w: [26, 62] },
    B: { h: [28, 70], n: [36, 76], p: [58, 86], k: [76, 82], f: [95, 80], k2: [66, 66], f2: [80, 72], e: [32, 66], w: [26, 62] }
  },
  legRaise: {
    A: { h: [24, 84], n: [34, 86], p: [58, 87], k: [76, 88], f: [95, 89], e: [42, 90], w: [52, 90] },
    B: { h: [24, 84], n: [34, 86], p: [58, 87], k: [62, 68], f: [64, 49], e: [42, 90], w: [52, 90] }
  },
  hangingRaise: {
    eq: BAR, floor: false,
    A: { h: [59, 25], n: [60, 36], p: [60, 62], e: [62, 24], w: [64, 12], k: [61, 80], f: [60, 98] },
    B: { h: [59, 25], n: [60, 36], p: [60, 62], e: [62, 24], w: [64, 12], k: [78, 62], f: [96, 62] }
  },
  russianTwist: {
    A: { h: [40, 52], n: [44, 62], p: [56, 84], k: [70, 70], f: [84, 78], e: [52, 70], w: [62, 66] },
    B: { h: [40, 52], n: [44, 62], p: [56, 84], k: [70, 70], f: [84, 78], e: [48, 74], w: [56, 80] }
  },
  abWheel: {
    A: { k: [38, 90], f: [24, 90], p: [44, 72], n: [62, 64], h: [72, 62], e: [64, 76], w: [66, 86] },
    B: { k: [38, 90], f: [24, 90], p: [56, 80], n: [80, 76], h: [90, 73], e: [92, 82], w: [100, 86] }, tool: 'wheel'
  },
  deadBug: {
    A: { h: [24, 82], n: [34, 84], p: [58, 86], e: [36, 72], w: [36, 60], k: [60, 70], f: [74, 70] },
    B: { h: [24, 82], n: [34, 84], p: [58, 86], e: [24, 78], w: [12, 80], k: [76, 82], f: [94, 84] }
  },
  cableCrunch: {
    A: { k: [56, 90], f: [40, 90], p: [56, 68], n: [58, 42], h: [60, 31], e: [66, 34], w: [62, 26] },
    B: { k: [56, 90], f: [40, 90], p: [56, 68], n: [72, 54], h: [80, 59], e: [74, 42], w: [78, 50] }, cable: [60, -6], tool: 'grip'
  },
  plank: {
    A: { f: [22, 90], k: [40, 86], p: [56, 82], n: [80, 78], h: [90, 76], e: [80, 90], w: [93, 90] },
    B: { f: [22, 90], k: [40, 86], p: [56, 81], n: [80, 78], h: [90, 76], e: [80, 90], w: [93, 90] }
  },
  sidePlank: {
    A: { f: [22, 90], k: [38, 82], p: [54, 74], n: [78, 62], h: [86, 55], e: [78, 76], w: [80, 90], e2: [78, 49], w2: [79, 36] },
    B: { f: [22, 90], k: [38, 82], p: [54, 73], n: [78, 62], h: [86, 55], e: [78, 76], w: [80, 90], e2: [78, 49], w2: [79, 36] }
  },
  hollow: {
    A: { p: [60, 88], n: [40, 82], h: [30, 77], e: [24, 75], w: [12, 72], k: [78, 82], f: [96, 76] },
    B: { p: [60, 88], n: [40, 81], h: [30, 76], e: [24, 74], w: [12, 71], k: [78, 81], f: [96, 75] }
  },
  swing: {
    A: { h: [75, 40], n: [66, 46], p: [44, 58], e: [62, 58], w: [58, 70], k: [62, 76], f: [56, 92] },
    B: st({ e: [71, 30], w: [83, 33] }), tool: 'kb'
  },
  thruster: {
    A: { h: [64, 37], n: [62, 48], p: [52, 72], k: [70, 78], f: [60, 92], e: [64, 60], w: [71, 49] },
    B: st({ e: [61, 14], w: [62, 1] }), tool: 'plate'
  },
  clean: {
    A: { h: [72, 52], n: [62, 58], p: [37, 64], e: [62, 70], w: [62, 82], k: [54, 76], f: [56, 92] },
    B: st({ e: [62, 39], w: [69, 28] }), tool: 'plate'
  },
  carry: {
    A: { h: [61, 16], n: [60, 27], p: [59, 53], e: [59, 40], w: [60, 53], k: [66, 72], f: [64, 92], k2: [54, 72], f2: [50, 92] },
    B: { h: [61, 16], n: [60, 27], p: [59, 53], e: [59, 40], w: [60, 53], k: [54, 72], f: [50, 92], k2: [66, 72], f2: [64, 92] }, tool: 'db'
  },
  burpee: {
    A: { f: [22, 90], k: [38, 82], p: [53, 75], n: [80, 62], h: [90, 58], e: [80, 77], w: [80, 92] },
    B: { h: [60, 8], n: [60, 19], p: [60, 45], e: [61, 6], w: [62, -6], k: [60, 64], f: [60, 84] }
  },
  climber: {
    A: { f: [22, 90], k: [38, 82], p: [53, 75], n: [80, 62], h: [90, 58], e: [80, 77], w: [80, 92], k2: [66, 78], f2: [58, 90] },
    B: { f: [58, 90], k: [66, 78], p: [53, 75], n: [80, 62], h: [90, 58], e: [80, 77], w: [80, 92], k2: [38, 82], f2: [22, 90] }
  },
  ropes: {
    A: { h: [62, 24], n: [60, 35], p: [54, 60], e: [68, 40], w: [76, 34], k: [66, 76], f: [60, 92] },
    B: { h: [62, 24], n: [60, 35], p: [54, 60], e: [68, 46], w: [78, 54], k: [66, 76], f: [60, 92] }, cable: [110, 88], tool: 'grip'
  },
  run: {
    A: { h: [63, 16], n: [61, 27], p: [57, 52], e: [52, 38], w: [58, 46], e2: [68, 33], w2: [75, 25], k: [70, 64], f: [66, 82], k2: [52, 70], f2: [40, 76] },
    B: { h: [63, 16], n: [61, 27], p: [57, 52], e: [68, 33], w: [75, 25], e2: [52, 38], w2: [58, 46], k: [52, 70], f: [40, 76], k2: [70, 64], f2: [66, 82] }
  },
  treadmill: {
    eq: [{ t: 'line', a: [20, 92], b: [100, 92], w: 5 }, { t: 'line', a: [100, 92], b: [94, 50], w: 4 }, { t: 'line', a: [94, 50], b: [84, 46], w: 4 }],
    floor: false,
    A: { h: [61, 16], n: [60, 27], p: [57, 52], e: [54, 39], w: [60, 47], e2: [66, 36], w2: [73, 30], k: [67, 70], f: [70, 90], k2: [53, 72], f2: [46, 90] },
    B: { h: [61, 16], n: [60, 27], p: [57, 52], e: [66, 36], w: [73, 30], e2: [54, 39], w2: [60, 47], k: [53, 72], f: [46, 90], k2: [67, 70], f2: [70, 90] }
  },
  walk: {
    A: { h: [60, 16], n: [60, 27], p: [59, 53], e: [56, 40], w: [55, 52], e2: [64, 40], w2: [67, 51], k: [66, 72], f: [68, 92], k2: [54, 72], f2: [50, 92] },
    B: { h: [60, 16], n: [60, 27], p: [59, 53], e: [64, 40], w: [67, 51], e2: [56, 40], w2: [55, 52], k: [54, 72], f: [50, 92], k2: [66, 72], f2: [68, 92] }
  },
  stairs: {
    eq: [{ t: 'poly', pts: [[30, 92], [30, 80], [50, 80], [50, 68], [70, 68], [70, 56], [92, 56]], w: 3 }],
    floor: false,
    A: { h: [56, 10], n: [56, 21], p: [55, 47], e: [58, 34], w: [64, 42], k: [64, 60], f: [62, 68], k2: [52, 66], f2: [44, 80] },
    B: { h: [62, 2], n: [62, 13], p: [61, 39], e: [64, 26], w: [70, 34], k: [64, 58], f: [64, 68], k2: [70, 48], f2: [76, 56] }
  },
  bike: {
    eq: [{ t: 'line', a: [52, 56], b: [60, 82], w: 4 }, { t: 'line', a: [82, 44], b: [74, 82], w: 4 }, { t: 'line', a: [44, 92], b: [90, 92], w: 4 }, { t: 'circle', c: [64, 80], r: 8 }],
    floor: false,
    A: { h: [72, 20], n: [66, 30], p: [50, 52], e: [74, 38], w: [82, 44], k: [70, 62], f: [70, 74] },
    B: { h: [72, 20], n: [66, 30], p: [50, 52], e: [74, 38], w: [82, 44], k: [64, 68], f: [58, 86] }
  },
  rower: {
    eq: [{ t: 'line', a: [14, 88], b: [104, 88], w: 4 }, { t: 'line', a: [92, 72], b: [92, 88], w: 4 }],
    floor: false,
    A: { h: [72, 46], n: [66, 56], p: [56, 82], k: [76, 62], f: [88, 80], e: [76, 62], w: [86, 64] },
    B: { h: [27, 45], n: [30, 56], p: [36, 82], k: [62, 74], f: [88, 80], e: [36, 68], w: [46, 62] }, cable: [100, 70], tool: 'grip'
  },
  elliptical: {
    eq: [{ t: 'line', a: [30, 92], b: [96, 92], w: 4 }, { t: 'line', a: [90, 92], b: [86, 40], w: 4 }],
    floor: false,
    A: { h: [60, 12], n: [60, 23], p: [59, 49], e: [70, 32], w: [80, 28], e2: [66, 36], w2: [76, 40], k: [68, 66], f: [66, 82], k2: [54, 70], f2: [48, 86] },
    B: { h: [60, 12], n: [60, 23], p: [59, 49], e: [66, 36], w: [76, 40], e2: [70, 32], w2: [80, 28], k: [54, 70], f: [48, 86], k2: [68, 66], f2: [66, 82] }
  },
  jumpRope: {
    eq: [{ t: 'ellipse', c: [60, 46], rx: 22, ry: 50 }],
    floor: true,
    A: st({ e: [52, 42], w: [46, 52] }),
    B: { h: [60, 11], n: [60, 22], p: [60, 48], e: [52, 37], w: [46, 47], k: [60, 67], f: [60, 87] }
  },
  swim: {
    eq: [{ t: 'line', a: [6, 50], b: [114, 50], w: 2 }], floor: false,
    A: { h: [86, 60], n: [76, 62], p: [50, 64], e: [88, 58], w: [100, 60], e2: [66, 66], w2: [56, 68], k: [32, 62], f: [14, 64], k2: [32, 68], f2: [14, 70] },
    B: { h: [86, 60], n: [76, 62], p: [50, 64], e: [66, 66], w: [56, 68], e2: [88, 58], w2: [100, 60], k: [32, 68], f: [14, 70], k2: [32, 62], f2: [14, 64] }
  },
  // custom exercises: a jumping jack, front view
  generic: {
    front: true,
    A: { h: [60, 16], n: [60, 27], p: [60, 53], e: [55, 40], w: [53, 52], e2: [65, 40], w2: [67, 52], k: [57, 72], f: [56, 92], k2: [63, 72], f2: [64, 92] },
    B: { h: [60, 16], n: [60, 27], p: [60, 53], e: [50, 18], w: [44, 6], e2: [70, 18], w2: [76, 6], k: [50, 72], f: [42, 92], k2: [70, 72], f2: [78, 92] }
  }
};

// Exercise id → [family, tool override]. Ids not listed (custom exercises) use 'generic'.
export const EXERCISE_FIGURES = {
  'bench-press': ['bench'], 'incline-bench-press': ['benchIncline'], 'decline-bench-press': ['bench'],
  'dumbbell-bench-press': ['bench', 'db'], 'incline-dumbbell-press': ['benchIncline', 'db'], 'chest-press-machine': ['chestPress'],
  'pec-deck': ['chestPress'], 'cable-fly': ['chestPress'], 'dumbbell-fly': ['fly'], 'push-ups': ['pushup'], 'incline-push-ups': ['pushup'], 'chest-dips': ['dips'],
  'pull-ups': ['pullup'], 'chin-ups': ['pullup'], 'weighted-pull-ups': ['pullup'], 'lat-pulldown': ['pulldown'], 'close-grip-pulldown': ['pulldown'],
  'straight-arm-pulldown': ['straightArm'], 'seated-cable-row': ['cableRow'], 'barbell-row': ['bentRow'], 'dumbbell-row': ['bentRow', 'db'],
  't-bar-row': ['bentRow'], 'machine-row': ['cableRow'], 'deadlift': ['deadlift'], 'back-extension': ['backExt'], 'shrugs': ['shrug'],
  'overhead-press': ['ohp'], 'dumbbell-shoulder-press': ['ohp', 'db'], 'shoulder-press-machine': ['ohp', 'grip'], 'arnold-press': ['ohp', 'db'],
  'lateral-raise': ['latRaise'], 'cable-lateral-raise': ['latRaise', 'grip'], 'front-raise': ['frontRaise'], 'rear-delt-fly': ['rearFly'],
  'face-pull': ['facePull'], 'upright-row': ['uprightRow'],
  'barbell-curl': ['curl', 'plate'], 'ez-bar-curl': ['curl', 'plate'], 'dumbbell-curl': ['curl'], 'hammer-curl': ['curl'], 'incline-dumbbell-curl': ['curl'],
  'preacher-curl': ['curl', 'plate'], 'cable-curl': ['cableCurl'], 'concentration-curl': ['curl'],
  'triceps-pushdown': ['pushdown'], 'rope-pushdown': ['pushdown'], 'overhead-triceps-extension': ['overheadExt'], 'skull-crushers': ['skull'],
  'close-grip-bench-press': ['bench'], 'triceps-kickback': ['kickback'], 'dips': ['dips'], 'bench-dips': ['dips'],
  'squat': ['squat'], 'front-squat': ['frontSquat'], 'goblet-squat': ['gobletSquat'], 'leg-press': ['legPress'], 'hack-squat': ['squat', 'none'],
  'romanian-deadlift': ['rdl'], 'lunges': ['lunge'], 'bulgarian-split-squat': ['splitSquat'], 'step-ups': ['stepUp'], 'leg-extension': ['legExt'],
  'lying-leg-curl': ['legCurl'], 'seated-leg-curl': ['seatedLegCurl'], 'hip-thrust': ['hipThrust'], 'hip-abduction': ['abduction'],
  'hip-adduction': ['abduction', null, true], 'standing-calf-raise': ['calfRaise'], 'seated-calf-raise': ['seatedCalf'],
  'crunches': ['crunch'], 'sit-ups': ['situp'], 'bicycle-crunch': ['bicycle'], 'leg-raises': ['legRaise'], 'hanging-leg-raise': ['hangingRaise'],
  'russian-twist': ['russianTwist'], 'ab-wheel-rollout': ['abWheel'], 'dead-bug': ['deadBug'], 'cable-crunch': ['cableCrunch'],
  'ab-crunch-machine': ['crunch'], 'plank': ['plank'], 'side-plank': ['sidePlank'], 'hollow-hold': ['hollow'],
  'kettlebell-swing': ['swing'], 'thrusters': ['thruster'], 'power-clean': ['clean'], 'farmer-s-carry': ['carry'], 'burpees': ['burpee'],
  'mountain-climbers': ['climber'], 'battle-ropes': ['ropes'],
  'treadmill-run': ['treadmill'], 'outdoor-run': ['run'], 'walking': ['walk'], 'incline-walk': ['treadmill'], 'stair-climber': ['stairs'],
  'stationary-bike': ['bike'], 'rowing-machine': ['rower'], 'elliptical': ['elliptical'], 'jump-rope': ['jumpRope'], 'swimming': ['swim']
};
