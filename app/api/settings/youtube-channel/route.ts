import { NextRequest, NextResponse } from 'next/server'

// GET /api/settings/youtube-channel - Get YouTube channel ID
// This is a simple endpoint that returns the channel ID from environment variable
// In the future, this could be stored in the database per church
export async function GET(request: NextRequest) {
  try {
    const channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: 'YouTube channel ID not configured' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      channelId,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
