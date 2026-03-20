'use client';

import { useState } from 'react';
import { signUp, signInWithGoogle } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Shield, 
  TrendingUp, 
  AlertCircle,
  MapPin,
  Briefcase,
  DollarSign,
  Target,
  Calendar,
  Users,
  PiggyBank,
  GraduationCap
} from 'lucide-react';
import Logo from '@/components/logo';
import { useToast } from '@/hooks/use-toast';

// List of disposable email domains (you can expand this)
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'throwaway.com', 'mailinator.com', 'guerrillamail.com',
  '10minutemail.com', 'yopmail.com', 'temp-mail.org', 'fakeinbox.com',
  'maildrop.cc', 'getairmail.com', 'dispostable.com', 'mailnesia.com',
  'trashmail.com', 'spamgourmet.com', 'spambox.us', 'tempr.email'
];

// Country list
const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'India', 
  'Germany', 'France', 'Japan', 'Singapore', 'UAE', 'Other'
];

// Occupation list
const OCCUPATIONS = [
  'Salaried Employee', 'Business Owner', 'Freelancer', 'Self-Employed',
  'Student', 'Retired', 'Homemaker', 'Unemployed', 'Other'
];

// Income ranges (annual)
const INCOME_RANGES = [
  'Under $25,000', '$25,000 - $50,000', '$50,000 - $75,000',
  '$75,000 - $100,000', '$100,000 - $150,000', '$150,000 - $200,000',
  'Over $200,000', 'Prefer not to say'
];

// Financial goals
const FINANCIAL_GOALS = [
  { id: 'saving', label: 'Save more money' },
  { id: 'investing', label: 'Start investing' },
  { id: 'debt', label: 'Pay off debt' },
  { id: 'budget', label: 'Better budgeting' },
  { id: 'tracking', label: 'Track expenses' },
  { id: 'retirement', label: 'Plan for retirement' },
  { id: 'house', label: 'Buy a house' },
  { id: 'emergency', label: 'Build emergency fund' },
];

// Experience levels
const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner - New to finance' },
  { id: 'intermediate', label: 'Intermediate - Some knowledge' },
  { id: 'advanced', label: 'Advanced - Experienced' },
  { id: 'expert', label: 'Expert - Financial professional' },
];

export default function SignupPage() {
  // Basic info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Personal info
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('');
  
  // Financial info
  const [incomeRange, setIncomeRange] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  const [hasEmergencyFund, setHasEmergencyFund] = useState<boolean | null>(null);
  const [monthlySavings, setMonthlySavings] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    const domain = email.split('@')[1].toLowerCase();
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return { valid: false, message: 'Please use a permanent email address (temporary emails are not allowed)' };
    }

    return { valid: true };
  };

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return null;
    if (pass.length < 6) return { text: 'Too short', color: 'text-destructive' };
    if (pass.length < 8) return { text: 'Weak', color: 'text-destructive' };
    if (pass.length < 10) return { text: 'Medium', color: 'text-yellow-500' };
    return { text: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const validateStep1 = () => {
    // Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.message);
      return false;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Validate display name
    if (displayName.trim().length < 2) {
      setError('Please enter your full name');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!country) {
      setError('Please select your country');
      return false;
    }
    if (!city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!age || parseInt(age) < 18 || parseInt(age) > 120) {
      setError('Please enter a valid age (18-120)');
      return false;
    }
    if (!occupation) {
      setError('Please select your occupation');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!incomeRange) {
      setError('Please select your income range');
      return false;
    }
    if (selectedGoals.length === 0) {
      setError('Please select at least one financial goal');
      return false;
    }
    if (!experienceLevel) {
      setError('Please select your financial experience level');
      return false;
    }
    if (hasEmergencyFund === null) {
      setError('Please answer if you have an emergency fund');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      handleNext();
      return;
    }

    // Validate step 3
    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First create the auth user
      const result = await signUp(email, password, displayName);
      
      if (result.success && result.user) {
        // Now save additional user data to Firestore
        const additionalUserData = {
          uid: result.user.uid,
          email,
          displayName,
          country,
          city,
          age: parseInt(age),
          occupation,
          incomeRange,
          financialGoals: selectedGoals,
          experienceLevel,
          hasEmergencyFund,
          monthlySavings: monthlySavings ? parseFloat(monthlySavings) : null,
          createdAt: new Date().toISOString(),
          onboardingCompleted: true,
          // Default preferences
          currency: country === 'India' ? 'INR' : 'USD',
          isPro: false,
          roundUpForClimate: false,
          ecoPoints: 0,
          completedChallenges: {},
          notifications: {
            weeklySummary: false,
            budgetAlerts: true,
            pushNotifications: {
              unusualTransactions: true,
              lowBalance: true,
              goalMilestones: true,
            }
          },
          accounts: []
        };

        // Save to Firestore
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        await setDoc(doc(db, 'users', result.user.uid), additionalUserData);

        toast({
          title: 'Account created!',
          description: 'Welcome to EcoVest! Please check your email to verify your account.',
        });
        
        // Redirect to dashboard or verification page
        router.push('/verify-email');
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // Check if user exists in Firestore, if not create with default values
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        if (result.user) {
          const userDocRef = doc(db, 'users', result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create basic user document
            await setDoc(userDocRef, {
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName || 'User',
              photoURL: result.user.photoURL || '',
              createdAt: new Date().toISOString(),
              currency: 'USD',
              isPro: false,
              roundUpForClimate: false,
              ecoPoints: 0,
              completedChallenges: {},
              notifications: {
                weeklySummary: false,
                budgetAlerts: true,
                pushNotifications: {
                  unusualTransactions: true,
                  lowBalance: true,
                  goalMilestones: true,
                }
              },
              accounts: [],
              onboardingCompleted: false // They'll need to complete onboarding
            });
            
            // Redirect to onboarding to collect additional info
            router.push('/onboarding');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        setError(result.message);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {currentStep === 1 && 'Create Your Account'}
            {currentStep === 2 && 'Tell Us About Yourself'}
            {currentStep === 3 && 'Financial Profile'}
          </h2>
          <p className="text-muted-foreground">
            {currentStep === 1 && 'Start managing your finances today'}
            {currentStep === 2 && 'Help us personalize your experience'}
            {currentStep === 3 && 'Last step to create your financial profile'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 px-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${currentStep >= step 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'}
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 rounded ${
                  currentStep > step ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Signup Card */}
        <div className="bg-card rounded-2xl shadow-xl border p-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm mb-4 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <>
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="displayName"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="Enter your full name"
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="email@example.com"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="Create a password (min. 6 characters)"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  {passwordStrength && (
                    <p className={`text-xs mt-1 ${passwordStrength.color}`}>
                      Password strength: {passwordStrength.text}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Personal Info */}
            {currentStep === 2 && (
              <>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all appearance-none"
                    >
                      <option value="">Select your country</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <div className="relative">
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="Enter your city"
                    />
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-foreground mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <input
                      id="age"
                      type="number"
                      min="18"
                      max="120"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="Enter your age"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label htmlFor="occupation" className="block text-sm font-medium text-foreground mb-2">
                    Occupation
                  </label>
                  <div className="relative">
                    <select
                      id="occupation"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all appearance-none"
                    >
                      <option value="">Select your occupation</option>
                      {OCCUPATIONS.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Financial Profile */}
            {currentStep === 3 && (
              <>
                <div>
                  <label htmlFor="incomeRange" className="block text-sm font-medium text-foreground mb-2">
                    Annual Income Range
                  </label>
                  <div className="relative">
                    <select
                      id="incomeRange"
                      value={incomeRange}
                      onChange={(e) => setIncomeRange(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all appearance-none"
                    >
                      <option value="">Select your income range</option>
                      {INCOME_RANGES.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Financial Goals (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {FINANCIAL_GOALS.map(goal => (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`
                          px-3 py-2 rounded-lg text-sm text-left transition-all
                          ${selectedGoals.includes(goal.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }
                        `}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-foreground mb-2">
                    Financial Experience Level
                  </label>
                  <div className="relative">
                    <select
                      id="experienceLevel"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all appearance-none"
                    >
                      <option value="">Select your experience level</option>
                      {EXPERIENCE_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.label}</option>
                      ))}
                    </select>
                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Do you have an emergency fund?
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setHasEmergencyFund(true)}
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${hasEmergencyFund === true
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasEmergencyFund(false)}
                      className={`
                        flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${hasEmergencyFund === false
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }
                      `}
                    >
                      No
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="monthlySavings" className="block text-sm font-medium text-foreground mb-2">
                    How much can you save monthly? (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="monthlySavings"
                      type="number"
                      min="0"
                      step="100"
                      value={monthlySavings}
                      onChange={(e) => setMonthlySavings(e.target.value)}
                      className="w-full px-4 py-3 pl-11 bg-background border-input border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all"
                      placeholder="Enter amount in your local currency"
                    />
                    <PiggyBank className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Back
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className={`${currentStep > 1 ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-primary/25`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
                    <span>
                      {currentStep === 3 ? 'Creating Account...' : 'Processing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {currentStep === 3 ? 'Create Account' : 'Continue'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Only show Google sign-in on first step */}
          {currentStep === 1 && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border text-foreground font-medium rounded-xl hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </>
          )}
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span>Trusted</span>
          </div>
        </div>
      </div>
    </div>
  );
}