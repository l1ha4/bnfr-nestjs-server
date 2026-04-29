import { BaseOAuthService } from "./services/base-oauth.service"

export const ProviderOptionsSymbol = Symbol()

export type TypeOptions = {
  baseUrl: string
  services: BaseOAuthService[]
}

export type TypeAsyncOptions = Promise<TypeOptions> | TypeOptions