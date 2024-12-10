import { Server } from 'socket.io'
import { NextApiRequest } from 'next'
import { db } from "@/lib/db"

export default function SocketHandler(req: NextApiRequest, res: any) {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      socket.on('createRoom', async () => {
        const roomId = Math.random().toString(36).substring(7)
        socket.join(roomId)
        socket.emit('roomCreated', { roomId })
      })

      socket.on('joinRoom', async (roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId)
        if (room && room.size < 2) {
          socket.join(roomId)
          if (room.size === 2) {
            startGame(roomId)
          }
        } else {
          socket.emit('roomFull')
        }
      })

      socket.on('submitAnswer', async ({ roomId, answer }) => {
        const gameState = global.gameStates[roomId]
        if (!gameState) return

        const currentQuestion = gameState.questions[gameState.currentQuestionIndex]
        if (answer.toLowerCase() === currentQuestion.answer.toLowerCase()) {
          updateScore(roomId, socket.id)
        }

        gameState.currentQuestionIndex++
        
        if (gameState.currentQuestionIndex % 5 === 0) {
          gameState.currentRound++
          io.to(roomId).emit('roundComplete', { round: gameState.currentRound })
        }

        if (gameState.currentRound > 10) {
          endGame(roomId)
        } else {
          nextQuestion(roomId)
        }
      })

      socket.on('restartGame', async (roomId) => {
        startGame(roomId)
      })
    })
  }
  res.end()
}

async function startGame(roomId: string) {
  const quizzes = await db.quiz.findMany({
    include: { questions: true },
    take: 10, // Get 10 quizzes for 10 rounds
  })

  const gameQuestions = quizzes.flatMap(quiz => quiz.questions.slice(0, 5)) // Get 5 questions from each quiz

  const gameState = {
    currentQuestionIndex: 0,
    currentRound: 1,
    questions: gameQuestions,
    scores: {},
  }

  global.gameStates = global.gameStates || {}
  global.gameStates[roomId] = gameState

  nextQuestion(roomId)
}

function nextQuestion(roomId: string) {
  const gameState = global.gameStates[roomId]
  if (gameState.currentQuestionIndex < gameState.questions.length) {
    const question = gameState.questions[gameState.currentQuestionIndex]
    io.to(roomId).emit('newQuestion', { 
      question: { id: question.id, question: question.question },
      round: gameState.currentRound,
      questionNumber: (gameState.currentQuestionIndex % 5) + 1
    })
  }
}

function updateScore(roomId: string, socketId: string) {
  const gameState = global.gameStates[roomId]
  gameState.scores[socketId] = (gameState.scores[socketId] || 0) + 1
  const scores = Object.values(gameState.scores)
  io.to(roomId).emit('scoreUpdate', {
    yourScore: gameState.scores[socketId],
    opponentScore: scores.find(score => score !== gameState.scores[socketId]) || 0,
  })
}

function endGame(roomId: string) {
  const gameState = global.gameStates[roomId]
  const scores = Object.values(gameState.scores)
  const winner = scores[0] > scores[1] ? 'Player 1' : scores[0] < scores[1] ? 'Player 2' : 'Tie'
  io.to(roomId).emit('gameOver', { 
    winner,
    finalScores: {
      player1: scores[0],
      player2: scores[1]
    }
  })
}

