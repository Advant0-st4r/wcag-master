import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const SignUpPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignUp = async () => {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password }]) // plain for Phase 1; hash later in Phase 2
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      navigate('/upload')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4" />
        <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-6" />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button onClick={handleSignUp} className="w-full">Sign Up</Button>
      </div>
    </div>
  )
}

export default SignUpPage

