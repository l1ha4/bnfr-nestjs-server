import { BaseOAuthService } from "./base-oauth.service";
import { TypeProviderOptions } from "./types/provider-options.types";
import { TypeUserInfo } from "./types/user-info.type";

interface DiscordProfile {
  id: string
  username: string
  global_name?: string
  discriminator: string
  avatar: string | null
  email?: string
  verified?: boolean
}

export class DiscordProvider extends BaseOAuthService {
  public constructor(options: TypeProviderOptions) {
    super({
      name: 'discord',
      authorize_url: 'https://discord.com/api/oauth2/authorize',
      access_url: 'https://discord.com/api/oauth2/token',
      profile_url: 'https://discord.com/api/users/@me',
      scopes: options.scopes ?? ['identify', 'email'],
      client_id: options.client_id,
      client_secret: options.client_secret,
    })
  }

  public async extractUserInfo(data: DiscordProfile): Promise<TypeUserInfo> {
    const avatar = data.avatar
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
      : null

    return super.extractUserInfo({
      email: data.email ?? null,
      name: data.global_name || data.username,
      picture: avatar,
    })
  }
}