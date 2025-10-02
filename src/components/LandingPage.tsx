import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-4xl font-bold mb-4">WCAG Master</h1>
      <p className="text-xl mb-8 max-w-md">AI-Powered Accessibility Optimizer: Automate WCAG compliance for ethical, inclusive frontend code.</p>
      <Button onClick={() => navigate('/signup')} size="lg">Get Started</Button>
    </div>
  )
}

export default LandingPage
