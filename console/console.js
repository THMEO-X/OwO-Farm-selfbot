// console/console.js
// require('./console/console') một lần ở đầu index.js — xong, 4 file không cần sửa gì

'use strict';

const c = require('./colors');

// ── RULES: match từ trên xuống, rule đầu tiên match thắng ─────────────────
const RULES = [

  // ── index.js ────────────────────────────────────────────────────────────

  // 🔴 red — fail / skip / remove
  { keys: ['already running, skipping'],          color: c.red },
  { keys: ['no token in'],                        color: c.red },
  { keys: ['no channel in'],                      color: c.red },
  { keys: ['login failed'],                       color: c.red },
  { keys: ['profile removed'],                    color: c.red },

  // 🟢 green — ok / start / watcher
  { keys: ['starting client for'],                color: c.green },
  { keys: ['logged in as'],                       color: c.green },
  { keys: ['session invalidated'],                color: c.green },
  { keys: ['error:'],                             color: c.green },
  { keys: ['.env changed'],                       color: c.green },

  // ── farm.js ─────────────────────────────────────────────────────────────

  // 🟣 purple — pause / resume / phrase skip
  { keys: ['auto pause'],                         color: c.purple },
  { keys: ['auto resume'],                        color: c.purple },
  { keys: ['resume  hold'],                       color: c.purple },
  { keys: ['phrase skip'],                        color: c.purple },
  { keys: [' pause '],                            color: c.purple },

  // 🔴 red — hunt skip/abort, timers, phrase sent, farm start
  { keys: ['hunt skip'],                          color: c.red },
  { keys: ['hunt abort'],                         color: c.red },
  { keys: ['battle abort'],                       color: c.red },
  { keys: ['phrase:'],                            color: c.red },
  { keys: ['farm start'],                         color: c.red },

  // next timer lines: "[tag] hunt 12.3s" / "[tag] battle 12.3s"
  // phân biệt với "Hunt #N" bằng cách check KHÔNG có "#"
  { keys: ['hunt '],    filter: s => !s.includes('#'), color: c.red },
  { keys: ['battle '],  filter: s => !s.includes('#') && !s.includes('skip') && !s.includes('abort'), color: c.red },

  // 🟢 green — hunt/battle success count
  { keys: ['hunt #'],                             color: c.green },
  { keys: ['battle #'],                           color: c.green },

  // #0c8d07 dark green — battle skip
  { keys: ['battle skip'],                        color: c.green2 },

  // ── inv.js ──────────────────────────────────────────────────────────────

  // 🔵 blue — tất cả gem / inv logs
  { keys: ['no inv'],                             color: c.blue },
  { keys: ['inventory:'],                         color: c.blue },
  { keys: ['no gem'],                             color: c.blue },
  { keys: ['resume fram'],                        color: c.blue },
  { keys: ['channel:'],                           color: c.blue },
  { keys: ['caught an'],                          color: c.blue },
  { keys: ['💎'],                                 color: c.blue },
  { keys: ['enough'],                             color: c.blue },
  { keys: ['burnt:'],                             color: c.blue },
  { keys: ['gem1', 'gem3', 'gem4'],               color: c.blue },
  { keys: ['owo use'],                            color: c.blue },

];

// ── Resolve color ───────────────────────────────────────────────────────────
function resolveColor(str) {
  const lower = str.toLowerCase();
  for (const rule of RULES) {
    const matched = rule.keys.some(k => lower.includes(k.toLowerCase()));
    if (matched) {
      // optional filter fn cho các case cần phân biệt thêm
      if (rule.filter && !rule.filter(lower)) continue;
      return rule.color;
    }
  }
  return c.dim;
}

// ── Patch console.log ───────────────────────────────────────────────────────
const _orig = console.log.bind(console);
console.log = function (...args) {
  const text = args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : String(a)
  ).join(' ');
  _orig(`${resolveColor(text)}${text}${c.reset}`);
};

// ── Patch console.error → luôn đỏ ──────────────────────────────────────────
const _origErr = console.error.bind(console);
console.error = function (...args) {
  const text = args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : String(a)
  ).join(' ');
  _origErr(`${c.red}${text}${c.reset}`);
};

// ── Patch console.warn → luôn tím ──────────────────────────────────────────
const _origWarn = console.warn.bind(console);
console.warn = function (...args) {
  const text = args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : String(a)
  ).join(' ');
  _origWarn(`${c.purple}${text}${c.reset}`);
};
