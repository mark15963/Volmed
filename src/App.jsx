import Content from './layouts/Content'
import Header from './layouts/Header'
import Footer from './layouts/Footer'

import { AuthProvider } from './context/AuthContext'

import './App.css'

export const App = () => {
  return (
    <>
      <AuthProvider>
        <Header />
        <Content />
        <Footer />
      </AuthProvider>
    </>
  )
}

export default App