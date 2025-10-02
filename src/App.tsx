import { Route, Routes } from 'react-router-dom'
import LandingPage from './components/LandingPage.tsx'
import SignUpPage from './components/SignUpPage.tsx'
import UploadPage from './components/UploadPage.tsx'
import ProcessPage from './components/ProcessPage.tsx'
import ResultPage from './components/ResultPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/process" element={<ProcessPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  )
}

export default App


