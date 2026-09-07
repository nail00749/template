import { readFile } from 'node:fs/promises'
import { Agent } from 'node:https'
import { env } from '@/shared/config/env'

let httpsAgentPromise: Promise<Agent> | undefined

async function createHttpsAgent(caCertsPath: string) {
  const ca = await readFile(caCertsPath)
  return new Agent({ ca })
}

export async function getServerHttpsAgentConfig() {
  if (!env.NODE_EXTRA_CA_CERTS) {
    return undefined
  }

  httpsAgentPromise ??= createHttpsAgent(env.NODE_EXTRA_CA_CERTS)
  const httpsAgent = await httpsAgentPromise

  return { httpsAgent }
}
