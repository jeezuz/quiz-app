import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const { title, questions } = json

    const quiz = await db.quiz.create({
      data: {
        title,
        creator: { connect: { id: session.user.id } },
        questions: {
          create: questions.map((q: { question: string; answer: string }) => ({
            question: q.question,
            answer: q.answer,
          })),
        },
      },
    })

    return NextResponse.json(quiz)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET() {
  try {
    const quizzes = await db.quiz.findMany({
      include: {
        creator: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json(quizzes)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

