# Gnars Terminal

Gnars Terminal is a decentralized application (dApp) built on the Base blockchain. It serves as an interface for interacting with the Gnars DAO, a decentralized autonomous organization on Base.

## Development

Install the dependencies:

```bash
pnpm install
```

Configure the environments based on [.env.example](/.env.example).

Run in development mode:

```bash
pnpm dev
```

> Please install prettier and configure VSCode to autoformat files on save

## Release

Build the project:

```bash
pnpm build
```

Start the builded project:

```bash
pnpm start
```

## Technologies Used

- Next.js (App Router)
- React
- TypeScript
- Wagmi
- Viem
- Chakra UI
- Apollo GraphQL
