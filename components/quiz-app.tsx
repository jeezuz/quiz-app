"use client"

import { useState } from 'react'
import { QuizCreator } from './quiz-creator'
import { QuizTaker } from './quiz-taker'

interface Question {
  question: string
  answer: string
}

export function QuizApp() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [isQuizCreated, setIsQuizCreated] = useState(false)

  const handleQuizCreate = (newQuestions: Question[]) => {
    setQuestions(newQuestions)
    setIsQuizCreated(true)
  }

  const handleQuizFinish = () => {
    setIsQuizCreated(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Quiz App</h1>
      {!isQuizCreated ? (
        <QuizCreator onQuizCreate={handleQuizCreate} />
      ) : (
        <QuizTaker questions={questions} onFinish={handleQuizFinish} />
      )}
    </div>
  )
}

