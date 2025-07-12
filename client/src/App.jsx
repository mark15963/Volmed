import { Header, Content, Footer } from './layouts/Structure'
import { AuthProvider } from './context/AuthContext'

import './App.css'

export const App = () => {
  return (
    <>
      <AuthProvider>
        <header>
          <Header />
        </header>
        <main>
          <Content />
        </main>
        <footer>
          <Footer />
        </footer>
      </AuthProvider>
    </>
  )
}

export default App