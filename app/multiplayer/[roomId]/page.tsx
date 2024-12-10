"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { io, Socket } from 'socket.io-client'

let socket: Socket

interface Question {
  id: string
  question: string
}

export default function MultiplayerGameRoom() {
  const params = useParams()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [round, setRound] = useState(1)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [finalScores, setFinalScores] = useState<{ player1: number; player2: number } | null>(null)

  useEffect(() => {
    socketInitializer()
    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {
      console.log('Connected to Socket.io server')
      socket.emit('joinRoom', params.roomId)
    })

    socket.on('newQuestion', (data) => {
      setQuestion(data.question)
      setRound(data.round)
      setQuestionNumber(data.questionNumber)
    })

    socket.on('scoreUpdate', (data) => {
      setScore(data.yourScore)
      setOpponentScore(data.opponentScore)
    })

    socket.on('roundComplete', (data) => {
      setRound(data.round)
    })

    socket.on('gameOver', (data) => {
      setGameOver(true)
      setWinner(data.winner)
      setFinalScores(data.finalScores)
    })
  }

  const submitAnswer = () => {
    socket.emit('submitAnswer', { roomId: params.roomId, answer })
    setAnswer('')
  }

  const restartGame = () => {
    socket.emit('restartGame', params.roomId)
    setGameOver(false)
    setWinner(null)
    setFinalScores(null)
    setScore(0)
    setOpponentScore(0)
    setRound(1)
    setQuestionNumber(1)
  }

  if (gameOver) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-6">Game Over!</h1>
        <p className="text-xl mb-4">Winner: {winner}</p>
        <p className="text-xl mb-4">Your score: {finalScores?.player1}</p>
        <p className="text-xl mb-4">Opponent's score: {finalScores?.player2}</p>
        <Button onClick={restartGame}>Restart Game</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Quiz</h1>
      <div className="mb-4">
        <p className="text-lg font-semibold">Round: {round} / 10</p>
        <p className="text-lg font-semibold">Question: {questionNumber} / 5</p>
        <p className="text-lg font-semibold">Your Score: {score}</p>
        <p className="text-lg font-semibold">Opponent's Score: {opponentScore}</p>
      </div>
      {question && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">{question.question}</h2>
          <Input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            className="mb-4"
          />
          <Button onClick={submitAnswer}>Submit Answer</Button>
        </div>
      )}
    </div>
  )
}

