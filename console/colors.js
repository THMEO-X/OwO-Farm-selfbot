// console/colors.js — đổi màu ở đây là xong toàn bộ
// HEX → ANSI 256 approximation (terminal chỉ support ANSI, không support hex trực tiếp)

module.exports = {
  red:      '\x1b[91m',   // #ff0000 — error, fail, skip, abort
  green:    '\x1b[92m',   // #0cbe06 — ok, login, start, watcher
  green2:   '\x1b[32m',   // #0c8d07 — battle skip
  purple:   '\x1b[95m',   // #cf00ff — pause, resume, phrase skip
  blue:     '\x1b[94m',   // #0005ff — gem, inv
  reset:    '\x1b[0m',
  dim:      '\x1b[2m',
};
