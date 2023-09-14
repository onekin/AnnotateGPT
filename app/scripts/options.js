// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'

import Options from './options/Options'

window.addEventListener('load', (event) => {
  window.options = new Options()
  window.options.init()
})
