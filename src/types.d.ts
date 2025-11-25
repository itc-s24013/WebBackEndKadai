import 'express-session'
import 'passport'

declare module 'express-session' {
  interface SessionData {
    messages: string[]
  }
}

declare global {
    namespace Express {
        interface User {
            id: string
            email: string
            name: string
            password: string
            is_admin: boolean
            created_at: Date
            updated_at: Date
            is_deleted: boolean
        }
    }
}

declare module 'passport' {
  interface AuthenticateOptions {
    badRequestMessage?: string | undefined
  }
}