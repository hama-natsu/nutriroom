'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Database } from '@/lib/database.types'
import type { User } from '@supabase/supabase-js'

type UserProfile = Database['public']['Tables']['user_profiles']['Update']

// ヒアリング質問データ
const questions = [
  {
    id: 'age_group',
    title: 'あなたの年代を教えてください',
    options: [
      { value: '20代', label: '20代' },
      { value: '30代', label: '30代' },
      { value: '40代', label: '40代' },
      { value: '50代以上', label: '50代以上' }
    ]
  },
  {
    id: 'goal_type',
    title: '栄養指導での主な目標は何ですか？',
    options: [
      { value: '体重管理', label: '体重管理' },
      { value: '健康維持', label: '健康維持' },
      { value: '筋肉増量', label: '筋肉増量' },
      { value: '生活習慣改善', label: '生活習慣改善' }
    ]
  },
  {
    id: 'activity_level_jp',
    title: '普段の活動レベルはどれくらいですか？',
    options: [
      { value: '座り仕事中心', label: '座り仕事中心' },
      { value: '軽い運動', label: '軽い運動（週1-2回）' },
      { value: '活発', label: '活発（週3-4回運動）' },
      { value: 'アスリート', label: 'アスリート（毎日運動）' }
    ]
  },
  {
    id: 'meal_timing',
    title: '食事のタイミングはどうですか？',
    options: [
      { value: '規則的', label: '規則的（決まった時間）' },
      { value: '不規則', label: '不規則（バラバラ）' },
      { value: '夜遅め', label: '夜遅め（22時以降が多い）' }
    ]
  },
  {
    id: 'cooking_frequency',
    title: '普段の食事はどのように準備していますか？',
    options: [
      { value: '毎日自炊', label: '毎日自炊' },
      { value: '時々', label: '時々自炊' },
      { value: '外食中心', label: '外食中心' },
      { value: 'コンビニ中心', label: 'コンビニ中心' }
    ]
  },
  {
    id: 'main_concern',
    title: '食事について一番気になることは？',
    options: [
      { value: '間食', label: '間食がやめられない' },
      { value: '偏食', label: '偏食・好き嫌いが多い' },
      { value: '量', label: '食べ過ぎてしまう' },
      { value: '栄養バランス', label: '栄養バランスが心配' }
    ]
  },
  {
    id: 'advice_style',
    title: 'どのようなアドバイスを希望しますか？',
    options: [
      { value: 'すぐ実践', label: 'すぐ実践できる具体的なもの' },
      { value: 'じっくり学習', label: 'じっくり学習できる詳しいもの' }
    ]
  },
  {
    id: 'info_preference',
    title: '情報量の好みを教えてください',
    options: [
      { value: '簡潔', label: '簡潔で分かりやすく' },
      { value: '詳しく', label: '詳しく専門的に' }
    ]
  }
]

export default function ProfileSetupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<UserProfile>>({})
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // 2問ずつ表示するステップ計算
  const questionsPerStep = 2
  const totalSteps = Math.ceil(questions.length / questionsPerStep)
  const currentQuestions = questions.slice(
    currentStep * questionsPerStep,
    (currentStep + 1) * questionsPerStep
  )

  useEffect(() => {
    // ユーザー認証状態をチェック
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // 既存のプロフィールをチェック
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile?.profile_completed) {
        router.push('/')
      }
    }

    getUser()
  }, [router, supabase])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    router.push('/')
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      const profileData = {
        ...answers,
        profile_completed: true,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profileData
        })

      if (error) throw error

      router.push('/')
    } catch (error) {
      console.error('Profile update error:', error)
      alert('プロフィールの保存に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100
  const canProceed = currentQuestions.every(q => answers[q.id as keyof UserProfile])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NutriRoom プロフィール設定
          </h1>
          <p className="text-gray-600">
            より良い栄養指導のため、あなたのことを教えてください
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>ステップ {currentStep + 1} / {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% 完了</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8 mb-8">
          {currentQuestions.map((question) => (
            <div key={question.id} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {question.title}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((option) => (
                  <label
                    key={option.value}
                    className={`
                      cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                      ${answers[question.id as keyof UserProfile] === option.value
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.value}
                      checked={answers[question.id as keyof UserProfile] === option.value}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="sr-only"
                    />
                    <span className="text-center block font-medium">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                戻る
              </button>
            )}
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              スキップして開始
            </button>
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className={`
              px-8 py-3 rounded-xl font-semibold transition-all duration-200
              ${canProceed && !loading
                ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              '保存中...'
            ) : currentStep === totalSteps - 1 ? (
              '完了'
            ) : (
              '次へ'
            )}
          </button>
        </div>

        {/* Skip Warning */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            💡 プロフィール設定を完了すると、より精度の高い栄養指導を受けることができます
          </p>
        </div>
      </div>
    </div>
  )
}