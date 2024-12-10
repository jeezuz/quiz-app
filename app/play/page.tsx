"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Quiz {
  id: string
  title: string
  creator: {
    name: string
  }
}

export default function PlayPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data))
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Play Quizzes</h1>
      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Link href={`/play/${quiz.id}`} key={quiz.id}>
            <Button className="w-full text-left justify-start" variant="outline">
              <div>
                <div className="font-bold">{quiz.title}</div>
                <div className="text-sm text-gray-500">Created by: {quiz.creator.name}</div>
              </div>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  )
}

