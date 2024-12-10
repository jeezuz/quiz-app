"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { io, Socket } from 'socket.io-client'

let socket: Socket

export default function MultiplayerPage() {
  const [roomId, setRoomId] = useState('')
  const [createdRoomId, setCreatedRoomId] = useState('')
  const [gameReady, setGameReady] = useState(false)
  const router = useRouter()

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
    })

    socket.on('roomCreated', (data) => {
      setCreatedRoomId(data.roomId)
    })

    socket.on('playerJoined', () => {
      setGameReady(true)
    })

    socket.on('gameStarted', (data) => {
      router.push(`/multiplayer/${data.roomId}`)
    })
  }

  const createRoom = () => {
    socket.emit('createRoom')
  }

  const joinRoom = () => {
    socket.emit('joinRoom', roomId)
  }

  const startGame = () => {
    socket.emit('startGame', createdRoomId)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Multiplayer Quiz</h1>
      <div className="space-y-4">
        <Button onClick={createRoom}>Create New Room</Button>
        {createdRoomId && (
          <div>
            <p>Room created! ID: {createdRoomId}</p>
            {gameReady && <Button onClick={startGame}>Start Game</Button>}
          </div>
        )}
        <div className="flex space-x-2">
          <Input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
          />
          <Button onClick={joinRoom}>Join Room</Button>
        </div>
      </div>
    </div>
  )
}

