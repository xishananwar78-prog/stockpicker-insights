# Project Architecture Rules

- Route all market-price lookups through one server-side Edge Function so the upstream provider stays isolated from browser code.