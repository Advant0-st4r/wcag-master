import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'

// TODO: Replace with Clerk <SignUp /> in Phase 1
const SignUpPage = () => {
  const navigate = useNavigate()

  const handleSignUp = () => {
    // Mock account creation
    navigate('/upload')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <Input placeholder="Email" className="mb-4" />
        <Input placeholder="Password" type="password" className="mb-6" />
        <Button onClick={handleSignUp} className="w-full">Sign Up</Button>
      </div>
    </div>
  )
}

export default SignUpPage

