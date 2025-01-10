# Token Advisor Next

A GameBoy-styled interface for monitoring new token releases from pump.fun.

## Prerequisites

- Node.js >= 18.17.0 (Required for Next.js)
- npm (comes with Node.js)

## Setup

1. Install Node.js 18.17.0 or later from [https://nodejs.org/](https://nodejs.org/)

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Real-time token monitoring from pump.fun
- GameBoy-styled interface
- Filter tokens by:
  - Initial SOL amount
  - Market Cap
  - Token Age
  - Tags in description

## How to Use

1. Set your desired filters:
   - Initial SOL: Minimum SOL amount in the pool
   - Token Age: Maximum age of tokens to show (in hours)
   - Min Market Cap: Minimum market capitalization
   - Tags: Comma-separated list of tags to search for in token descriptions

2. Click the START button to begin monitoring
3. New tokens that match your criteria will appear in the table
4. Click STOP to pause monitoring
