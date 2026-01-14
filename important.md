# Switching Dodo Payments Between Test and Live Mode

To switch Dodo Payments between test and live mode, follow these steps in order:

1. **Update the environment mode in `lib/dodo-payments.ts`:**
   - Change the `environment` property to either `"test_mode"` or `"live_mode"`

2. **Update the environment variables:**
   - Ensure your `.env` or `.env.local`  or `.env.production` file contains the correct API key for the selected mode
   - Test mode: Use your test API key
   - Live mode: Use your production API key

**Important:** Always update the code configuration first, then update the environment variables to match.