import store from './store'
import './app.scss'

const App = {
  store,
  onShow() {},
  render(h: any) {
    return h('block', this.$slots.default)
  }
}

export default App
