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

## Typing GraphQL Queries

You can make GraphQL bareable, by using the following command to generate types for newly created graphql queries. 

```bash
bun run graphql-codegen
```

It will look for all strings through the file that have `#graphql` at the start, and then store typescript types inside `/app/types`.
