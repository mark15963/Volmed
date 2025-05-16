import './App.css'
import { Header, Content, Footer } from './layouts/Structure'

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