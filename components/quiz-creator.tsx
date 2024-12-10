"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Question {
  question: string
  answer: string
}

export function QuizCreator() {
  const [quizTitle, setQuizTitle] = useState('')
  const [inputMethod, setInputMethod] = useState('individual')
  const [questions, setQuestions] = useState<Question[]>([{ question: '', answer: '' }])
  const [bulkInput, setBulkInput] = useState('')
  const router = useRouter()
  const { data: session } = useSession()

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', answer: '' }])
  }

  const handleQuestionChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index][field] = value
    setQuestions(updatedQuestions)
  }

  const handleBulkInputChange = (value: string) => {
    setBulkInput(value)
    const lines = value.split('\n')
    const parsedQuestions: Question[] = []
    
    for (let i = 0; i < lines.length; i += 2) {
      if (lines[i] && lines[i + 1]) {
        parsedQuestions.push({
          question: lines[i].trim(),
          answer: lines[i + 1].trim()
        })
      }
    }
    
    setQuestions(parsedQuestions)
  }

  const handleCreate = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    const finalQuestions = inputMethod === 'individual' ? questions : questions.filter(q => q.question && q.answer)

    const response = await fetch('/api/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: quizTitle,
        questions: finalQuestions,
      }),
    })

    if (response.ok) {
      router.push('/play')
    } else {
      console.error('Failed to create quiz')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="quiz-title">Quiz Title</Label>
        <Input
          id="quiz-title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Enter quiz title"
        />
      </div>
      
      <RadioGroup value={inputMethod} onValueChange={setInputMethod} className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="individual" id="individual" />
          <Label htmlFor="individual">Individual Questions</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="bulk" id="bulk" />
          <Label htmlFor="bulk">Bulk Input</Label>
        </div>
      </RadioGroup>

      {inputMethod === 'individual' ? (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={index} className="space-y-2">
              <Input
                value={q.question}
                onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                placeholder={`Question ${index + 1}`}
              />
              <Input
                value={q.answer}
                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                placeholder={`Answer ${index + 1}`}
              />
            </div>
          ))}
          <Button onClick={handleAddQuestion} variant="outline">Add Question</Button>
        </div>
      ) : (
        <div>
          <Label htmlFor="bulk-input">Enter Questions and Answers</Label>
          <Textarea
            id="bulk-input"
            value={bulkInput}
            onChange={(e) => handleBulkInputChange(e.target.value)}
            placeholder="Enter questions and answers, one per line:&#10;Question 1&#10;Answer 1&#10;Question 2&#10;Answer 2"
            rows={10}
          />
        </div>
      )}
      
      <Button onClick={handleCreate} className="w-full">Create Quiz</Button>
    </div>
  )
}

