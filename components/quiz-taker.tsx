import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Question {
  question: string
  answer: string
}

interface QuizTakerProps {
  questions: Question[]
  onFinish: () => void
}

export function QuizTaker({ questions, onFinish }: QuizTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    if (userAnswer.toLowerCase() === questions[currentQuestion].answer.toLowerCase()) {
      setScore(score + 1)
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setUserAnswer('')
    } else {
      setShowResult(true)
    }
  }

  const handleFinish = () => {
    setCurrentQuestion(0)
    setUserAnswer('')
    setScore(0)
    setShowResult(false)
    onFinish()
  }

  if (showResult) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">Quiz Completed!</h2>
        <p className="text-xl">Your score: {score} out of {questions.length}</p>
        <Button onClick={handleFinish}>Finish</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Question {currentQuestion + 1} of {questions.length}</h2>
      <p>{questions[currentQuestion].question}</p>
      <div>
        <Label htmlFor="user-answer">Your Answer</Label>
        <Input
          id="user-answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="Enter your answer"
        />
      </div>
      <Button onClick={handleSubmit}>Submit Answer</Button>
    </div>
  )
}

