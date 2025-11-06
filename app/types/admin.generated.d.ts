/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type CurrentWishlistQueryVariables = AdminTypes.Exact<{
  id: AdminTypes.Scalars['ID']['input'];
}>;


export type CurrentWishlistQuery = { customer?: AdminTypes.Maybe<{ metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'jsonValue'>> }> };

export type SetWishlistMutationVariables = AdminTypes.Exact<{
  ownerId: AdminTypes.Scalars['ID']['input'];
  value: AdminTypes.Scalars['String']['input'];
}>;


export type SetWishlistMutation = { metafieldsSet?: AdminTypes.Maybe<{ metafields?: AdminTypes.Maybe<Array<Pick<AdminTypes.Metafield, 'id' | 'key' | 'namespace' | 'type'>>>, userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message' | 'code'>> }> };

interface GeneratedQueryTypes {
  "#graphql\n        query CurrentWishlist($id: ID!) {\n          customer(id: $id) {\n            metafield(namespace: \"custom\", key: \"wishlist\") {\n              jsonValue\n            }\n          }\n        }\n      ": {return: CurrentWishlistQuery, variables: CurrentWishlistQueryVariables},
}

interface GeneratedMutationTypes {
  "#graphql\n            mutation SetWishlist($ownerId: ID!, $value: String!) {\n              metafieldsSet(metafields: [{\n                ownerId:$ownerId,\n                namespace: \"custom\",\n                key: \"wishlist\",\n                type: \"list.product_reference\",\n                value: $value\n              }]) {\n                metafields { id key namespace type }\n                userErrors { field message code }\n              }\n            }\n        ": {return: SetWishlistMutation, variables: SetWishlistMutationVariables},
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
