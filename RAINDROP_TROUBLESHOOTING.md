# Raindrop Deployment Troubleshooting

## Issue: npx not found during build

The error occurs because `npx` is not in your system PATH. Here are the solutions:

### Solution 1: Run Type Check Manually

```bash
# Run TypeScript check directly
npm run type-check

# If that passes, try deployment again
raindrop build deploy
```

### Solution 2: Add Node.js to PATH (Windows)

1. Find your Node.js installation (usually `C:\Program Files\nodejs\`)
2. Add it to your system PATH:
   - Press Windows Key + Pause/Break
   - Advanced system settings → Environment Variables
   - Edit PATH → Add `C:\Program Files\nodejs\`
3. Restart PowerShell/Command Prompt

### Solution 3: Use Full Path

If you know your Node.js path, you can use it directly:
```bash
# Replace with your actual Node.js path
"C:\Program Files\nodejs\npx.cmd" tsc --noEmit
```

### Solution 4: Create a Batch File

Create `rundev.bat` in your project:
```batch
@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
raindrop build deploy
```

## CORS Warning Fix

The security warning about `corsAllowAll` has been fixed by:
- Creating proper CORS configuration in `src/_app/cors.ts`
- Specifying allowed origins instead of allowing all origins
- Using `createCorsHandler()` with specific settings

## Next Steps

1. Try the manual type check: `npm run type-check`
2. If successful, run: `raindrop build deploy`
3. If you still get npx errors, fix your Node.js PATH
4. The CORS warning should now be resolved

## Alternative: Skip Type Check

If you want to deploy without TypeScript validation (not recommended for production):

1. Temporarily rename your TypeScript files
2. Or modify the Raindrop build process to skip validation
3. Deploy, then restore TypeScript files

Let me know which approach works for you!