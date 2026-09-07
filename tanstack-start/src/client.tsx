import { StartClient } from '@tanstack/react-start/client'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import * as z from 'zod'
import { ru } from 'zod/locales'

z.config(ru())

hydrateRoot(
  document,
  <StrictMode>
    <StartClient />
  </StrictMode>,
)
