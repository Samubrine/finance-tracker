import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase } from "@/lib/prisma"

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

    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

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

    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        category,
        limit: parseFloat(limit),
        period,
        user_id: session.user.id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error("Create budget error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
