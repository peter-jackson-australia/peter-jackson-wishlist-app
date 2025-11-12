# Wishlist

## Development

### Install Dependencies

```bash
bun install
```

### Staring Server

```bash
bun dev
```

## Deploying

1. Deploy the app to Railway, or another hosting service
2. Wait for it to complete the deployment
3. Uninstall, and re-install the app

This will trigger the uninstall/reinstall webhooks to allow the server to detect these changes

## Typing GraphQL Queries

You can make GraphQL bareable, by using the following command to generate types for newly created graphql queries. 

```bash
bun run graphql-codegen
```

It will look for all strings through the file that have `#graphql` at the start, and then store typescript types inside `/app/types`.