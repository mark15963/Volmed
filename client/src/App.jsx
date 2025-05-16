import './App.css'
import { Header, Content, Footer } from './layouts/Structure'

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

export const App = () => {

  return (
    <>
      <div className='header'>
        <Header title='ГБУ «Городская больница Волновахского района»' />
      </div>
      <div className='content'>
        <Content />
      </div>
      <div className='footer'>
        <Footer />
      </div>
    </>
  )
}

export default App