// Simple CORS configuration for Raindrop
// Using string-based headers for now since we don't have the framework types yet

export const corsAllowAll = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};