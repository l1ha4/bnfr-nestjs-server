export type TypeUserInfo = {
  id: string
  picture: string
  name: string
  email: string
  access_token?: string | null
  refresh_token?: string
  exprires_at?: number
  provider: string
}