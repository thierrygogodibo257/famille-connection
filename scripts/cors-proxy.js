#!/usr/bin/env node

/**
 * Proxy CORS local pour Supabase Auth
 * Usage: node scripts/cors-proxy.js
 */

import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = 3001;

// Configuration CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'x-client-info', 'x-admin-secret']
}));

// Proxy pour Supabase Auth
app.use('/auth', createProxyMiddleware({
  target: 'https://rrlixvlwsaeaugudwbiw.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/auth/v1'
  },
  onProxyRes: function (proxyRes, req, res) {
    // Ajouter les en-têtes CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, apikey, x-client-info, x-admin-secret';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));

// Proxy pour Supabase REST API
app.use('/rest', createProxyMiddleware({
  target: 'https://rrlixvlwsaeaugudwbiw.supabase.co',
  changeOrigin: true,
  onProxyRes: function (proxyRes, req, res) {
    // Ajouter les en-têtes CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, apikey, x-client-info, x-admin-secret';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));

// Proxy pour Supabase Edge Functions
app.use('/functions', createProxyMiddleware({
  target: 'https://rrlixvlwsaeaugudwbiw.supabase.co',
  changeOrigin: true,
  pathRewrite: {
    '^/functions': '/functions/v1'
  },
  onProxyRes: function (proxyRes, req, res) {
    // Ajouter les en-têtes CORS
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, apikey, x-client-info, x-admin-secret';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));

// Route de test
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CORS Proxy is running',
    timestamp: new Date().toISOString()
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Proxy error:', err);
  res.status(500).json({ error: 'Proxy error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy running on http://localhost:${PORT}`);
  console.log(`📡 Proxying to: https://rrlixvlwsaeaugudwbiw.supabase.co`);
  console.log(`🔧 Available routes:`);
  console.log(`   - /auth/* -> /auth/v1/*`);
  console.log(`   - /rest/* -> /rest/v1/*`);
  console.log(`   - /functions/* -> /functions/v1/*`);
  console.log(`   - /health -> Health check`);
  console.log(`\n💡 To use this proxy, update your VITE_SUPABASE_URL to: http://localhost:${PORT}`);
});

export default app;
