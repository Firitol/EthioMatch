'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Database, User } from '@/lib/db';
import { Heart, Coins, Crown, Shield, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, createUser, currentUser } = useAuth();
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female'>('female');
  const [regGoal, setRegGoal] = useState<'marriage' | 'serious' | 'dating'>('serious');
  const [regBio, setRegBio] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regError, setRegError] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  // Password Reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser && !isLoading) {
      router.push('/app');
    }
  }, [currentUser, isLoading, router]);

  if (currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const user = Database.validatePassword(loginEmail, loginPassword);
      if (user) {
        // Set current user in localStorage and auth context
        Database.setCurrentUser(user);
        await login(user.id);
        router.push('/app');
      } else {
        setLoginError('Invalid email or password');
      }
    } catch (error) {
      console.error('[v0] Login error:', error);
      setLoginError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsLoading(true);

    try {
      // Validation
      if (!regName || !regEmail || !regPassword || !regAge || !regLocation) {
        setRegError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (regPassword !== regConfirmPassword) {
        setRegError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (regPassword.length < 6) {
        setRegError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      const age = parseInt(regAge);
      if (isNaN(age) || age < 18 || age > 100) {
        setRegError('Please enter a valid age (18+)');
        setIsLoading(false);
        return;
      }

      // Check if email exists
      const existingUser = Database.findUserByEmail(regEmail);
      console.log('[v0] Checking existing user:', existingUser);
      if (existingUser) {
        setRegError('Email already registered');
        setIsLoading(false);
        return;
      }

      // Create new user with 10 free tokens
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: regEmail,
        password: regPassword,
        name: regName,
        age,
        gender: regGender,
        relationshipGoal: regGoal,
        bio: regBio || 'Hello! I am new to Ethiomatch.',
        photos: [],
        videos: [],
        interests: [],
        location: regLocation,
        tokens: 10,
        isPremium: false,
        createdAt: Date.now(),
      };

      console.log('[v0] Creating new user:', newUser);
      createUser(newUser);
      console.log('[v0] User created, redirecting to /app');
      router.push('/app');
    } catch {
      setRegError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setIsLoading(true);

    try {
      // Validation
      if (!resetEmail) {
        setResetError('Please enter your email address');
        setIsLoading(false);
        return;
      }

      if (!resetNewPassword) {
        setResetError('Please enter a new password');
        setIsLoading(false);
        return;
      }

      if (resetNewPassword !== resetConfirmPassword) {
        setResetError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (resetNewPassword.length < 6) {
        setResetError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }

      // Find user by email locally first to validate
      const user = Database.findUserByEmail(resetEmail);
      if (!user) {
        setResetError('No account found with this email address');
        setIsLoading(false);
        return;
      }

      // Update password using API
      try {
        const response = await fetch('/api/password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: resetEmail,
            newPassword: resetNewPassword,
          }),
        });

        if (response.ok) {
          // Also update in local database as fallback
          const users = Database.getUsers();
          const userIndex = users.findIndex(u => u.email.toLowerCase() === resetEmail.toLowerCase());
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], password: resetNewPassword };
            Database.saveUsers(users);
          }

          setResetSuccess('Password reset successfully! Please log in with your new password.');
          
          // Clear form after 2 seconds
          setTimeout(() => {
            setResetEmail('');
            setResetNewPassword('');
            setResetConfirmPassword('');
            setResetSuccess('');
          }, 2000);
        } else {
          const errorData = await response.json();
          setResetError(errorData.error || 'Failed to reset password');
        }
      } catch (apiError) {
        console.error('[v0] API error during password reset:', apiError);
        // Fallback to local database update
        const users = Database.getUsers();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === resetEmail.toLowerCase());
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], password: resetNewPassword };
          Database.saveUsers(users);
          setResetSuccess('Password reset successfully! Please log in with your new password.');
          
          setTimeout(() => {
            setResetEmail('');
            setResetNewPassword('');
            setResetConfirmPassword('');
            setResetSuccess('');
          }, 2000);
        } else {
          setResetError('An error occurred. Please try again.');
        }
      }
    } catch (error) {
      console.error('[v0] Password reset error:', error);
      setResetError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <Heart className="w-10 h-10 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Ethiomatch</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Features Banner */}
          <div className="mb-8 text-center">
            <p className="text-xl text-gray-700 mb-4">Find Your Perfect Match</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-gray-700">10 Free Messages</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                <Crown className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700">Premium Unlimited</span>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Verified Profiles</span>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="bg-white shadow-xl border-0">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs md:text-sm">
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs md:text-sm">
                    Register
                  </TabsTrigger>
                  <TabsTrigger value="reset" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs md:text-sm">
                    Reset
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Login Tab */}
              <TabsContent value="login" className="mt-0">
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    {loginError && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{loginError}</p>
                    )}
                    
                    <Button
                      type="submit"
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>

                  {/* Demo Accounts */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 text-center mb-3">Demo accounts (password: password123)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['aisha@example.com', 'getnet@example.com'].map((email) => (
                        <button
                          key={email}
                          onClick={() => {
                            setLoginEmail(email);
                            setLoginPassword('password123');
                          }}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded text-gray-700 transition"
                        >
                          {email.split('@')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="mt-0">
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Full Name *</Label>
                        <Input
                          id="reg-name"
                          placeholder="Your name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-age">Age *</Label>
                        <Input
                          id="reg-age"
                          type="number"
                          placeholder="18+"
                          min="18"
                          max="100"
                          value={regAge}
                          onChange={(e) => setRegAge(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email *</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="your@email.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="reg-password"
                            type={showRegPassword ? 'text' : 'password'}
                            placeholder="Min 6 chars"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Confirm *</Label>
                        <Input
                          id="reg-confirm"
                          type="password"
                          placeholder="Repeat password"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-gender">Gender *</Label>
                        <Select value={regGender} onValueChange={(v) => setRegGender(v as 'male' | 'female')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-goal">Looking for *</Label>
                        <Select value={regGoal} onValueChange={(v) => setRegGoal(v as 'marriage' | 'serious' | 'dating')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="marriage">Marriage</SelectItem>
                            <SelectItem value="serious">Serious Relationship</SelectItem>
                            <SelectItem value="dating">Dating</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-location">Location *</Label>
                      <Input
                        id="reg-location"
                        placeholder="City, Country"
                        value={regLocation}
                        onChange={(e) => setRegLocation(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-bio">Bio (optional)</Label>
                      <Textarea
                        id="reg-bio"
                        placeholder="Tell us about yourself..."
                        value={regBio}
                        onChange={(e) => setRegBio(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {regError && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{regError}</p>
                    )}

                    <div className="bg-amber-50 p-3 rounded-lg flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="text-sm text-amber-800">Get 10 free message tokens on signup!</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              {/* Password Reset Tab */}
              <TabsContent value="reset" className="mt-0">
                <CardContent>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                      <p className="text-sm text-blue-800">Enter your email and new password to reset your account.</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address *</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reset-password">New Password *</Label>
                      <div className="relative">
                        <Input
                          id="reset-password"
                          type={showResetPassword ? 'text' : 'password'}
                          placeholder="Min 6 characters"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reset-confirm">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="reset-confirm"
                          type={showResetConfirm ? 'text' : 'password'}
                          placeholder="Repeat password"
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetConfirm(!showResetConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showResetConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {resetError && (
                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{resetError}</p>
                    )}

                    {resetSuccess && (
                      <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{resetSuccess}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      Remember your password? <a href="#login" className="text-blue-600 hover:underline">Sign in</a>
                    </p>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </main>
    </div>
  );
}
