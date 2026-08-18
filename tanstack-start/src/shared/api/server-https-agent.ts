let httpsAgentPromise: Promise<unknown | undefined> | undefined

function getExtraCaCertsPath() {
  if (typeof process === 'undefined') {
    return undefined
  }

  return process.env.NODE_EXTRA_CA_CERTS
}

async function createHttpsAgent(caCertsPath: string) {
  const [{ readFile }, { Agent }] = await Promise.all([
    import('node:fs/promises'),
    import('node:https'),
  ])

  const ca = await readFile(caCertsPath)
  return new Agent({ ca })
}

export async function getServerHttpsAgentConfig() {
  if (!import.meta.env.SSR) {
    return undefined
  }

  const caCertsPath = getExtraCaCertsPath()
  if (!caCertsPath) {
    return undefined
  }

  httpsAgentPromise ??= createHttpsAgent(caCertsPath)
  const httpsAgent = await httpsAgentPromise

  return { httpsAgent }
}
