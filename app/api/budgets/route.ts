import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all budgets for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(budgets)
  } catch (error) {
    console.error("Get budgets error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// POST create a new budget
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { category, limit, period } = body

    if (!category || !limit || !period) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        category,
        limit: parseFloat(limit),
        period,
        userId: session.user.id
      }
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Create budget error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
