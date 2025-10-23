import { AppProviders } from './context/index'
import Content from './layouts/Content'
import Header from './layouts/header/Header'
import Footer from './layouts/Footer'

import './App.css'

const App = () => {
  return (
    <AppProviders>
      <Header />
      <Content />
      <Footer />
    </AppProviders>
  )
}

export default App