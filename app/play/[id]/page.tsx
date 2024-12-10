"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Question {
  id: string
  question: string
  answer: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

export default function PlayQuizPage() {
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    fetch(`/api/quizzes/${params.id}`)
      .then(res => res.json())
      .then(data => setQuiz(data))
  }, [params.id])

  if (!quiz) {
    return <div>Loading...</div>
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  const handleSubmit = () => {
    if (userAnswer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setScore(score + 1)
    }

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setUserAnswer('')
    } else {
      setShowResult(true)
    }
  }

  if (showResult) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
        <h2 className="text-2xl mb-4">Quiz Completed!</h2>
        <p className="text-xl mb-4">Your score: {score} out of {quiz.questions.length}</p>
        <Button onClick={() => window.location.href = '/play'}>Back to Quizzes</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Question {currentQuestionIndex + 1} of {quiz.questions.length}</h2>
        <p className="text-lg mb-4">{currentQuestion.question}</p>
        <Input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Your answer"
          className="mb-4"
        />
        <Button onClick={handleSubmit}>Submit Answer</Button>
      </div>
    </div>
  )
}

