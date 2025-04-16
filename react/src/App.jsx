import './App.css'
import { Header } from '../components/header/header'
import { Content } from '../components/content/content'
import { Footer } from '../components/footer/footer'

export const App = (props) => {

  return (
    <>
      <div className='header'>
        <Header />
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