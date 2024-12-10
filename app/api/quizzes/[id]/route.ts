import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await db.quiz.findUnique({
      where: {
        id: params.id,
      },
      include: {
        questions: true,
      },
    })

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 })
    }

    return NextResponse.json(quiz)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

