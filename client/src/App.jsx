import './App.css'
import { Header, Content, Footer } from './components/Structure/Structure'

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