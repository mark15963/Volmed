import { Header, Content, Footer } from './layouts/Structure'
import { AuthProvider } from './context/AuthContext'

//fonts
import './assets/fonts/Montserrat-Black.ttf'
import './assets/fonts/Montserrat-Bold.ttf'
import './assets/fonts/Montserrat-ExtraBold.ttf'
import './assets/fonts/Montserrat-ExtraLight.ttf'
import './assets/fonts/Montserrat-Light.ttf'
import './assets/fonts/Montserrat-Medium.ttf'
import './assets/fonts/Montserrat-Regular.ttf'
import './assets/fonts/Montserrat-SemiBold.ttf'
import './assets/fonts/Montserrat-Thin.ttf'
import './assets/fonts/Montserrat-VariableFont_wght.ttf'

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