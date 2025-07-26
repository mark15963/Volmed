import { AppProviders } from './context/index'
import Content from './layouts/Content'
import Header from './layouts/Header'
import Footer from './layouts/Footer'

import './App.css'

function App() {
  return (
    <AppProviders>
      <Header />
      <Content />
      <Footer />
    </AppProviders>
  )
}

export default App