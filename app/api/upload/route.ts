import { NextResponse, type NextRequest } from 'next/server'
import { handleError } from '../utils'
import FileManager from '@/utils/FileManager'
import { ErrorType } from '@/constant/errors'
import { isNull } from 'lodash-es'

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

const geminiApiKey = process.env.GEMINI_API_KEY as string
const geminiApiBaseUrl = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com'

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const uploadType = searchParams.get('uploadType')

  try {
    const fileManager = new FileManager({
      apiKey: geminiApiKey,
      baseUrl: geminiApiBaseUrl,
    })
    if (uploadType === 'resumable') {
      const { fileName, mimeType } = await req.json()
      const sessionUrl = await fileManager.createUploadSession(fileName, mimeType)
      if (isNull(sessionUrl)) {
        return NextResponse.json({ code: 50002, message: ErrorType.NoUploadURL }, { status: 500 })
      }
      const uploadUrl = new URL(sessionUrl)
      uploadUrl.protocol = req.nextUrl.protocol
      uploadUrl.host = req.nextUrl.host
      uploadUrl.pathname = '/api/upload/files'
      uploadUrl.searchParams.delete('key')
      const url = uploadUrl.toString()
      return NextResponse.json({ url }, { headers: { Location: url } })
    } else {
      throw new Error(ErrorType.UnsupportedApiType)
    }
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
