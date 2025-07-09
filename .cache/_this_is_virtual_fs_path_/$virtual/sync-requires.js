
// prefer default export if available
const preferDefault = m => (m && m.default) || m


exports.components = {
  "component---src-pages-index-jsx": preferDefault(require("/home/runner/work/planning-poker/planning-poker/src/pages/index.jsx")),
  "component---src-pages-ssr-jsx": preferDefault(require("/home/runner/work/planning-poker/planning-poker/src/pages/ssr.jsx"))
}

