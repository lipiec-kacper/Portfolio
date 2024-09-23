import fs from 'node:fs/promises'
import express from 'express'
import path from 'path'

// Constants
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : ''
const ssrManifest = isProduction
  ? await fs.readFile('./dist/client/.vite/ssr-manifest.json', 'utf-8')
  : undefined

// Create http server
const app = express()

// Serve static files from the "public" directory
const publicDir = path.join(process.cwd(), 'public')
app.use('/public', express.static(publicDir))

// Serve node_modules (optional, but remember it's a security risk)
const nodeModulesDir = path.join(process.cwd(), 'node_modules')
app.use('/node_modules', express.static(nodeModulesDir))

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.get('/', async (req, res) => {
  try {
    let template
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(req.originalUrl, template)
    } else {
      template = templateHtml
    }

    res.status(200).set({ 'Content-Type': 'text/html' }).send(template)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
