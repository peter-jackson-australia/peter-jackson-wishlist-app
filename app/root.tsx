import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "./shopify.server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";

const http400 = (message: string): Response => {
  return Response.json({ error: message }, { status: 400 });
};

const http500 = (): Response => {
  return Response.json({ error: "internal server error" }, { status: 500 });
};

const customerService = (admin: AdminApiContextWithoutRest) => {
  return {
    getCustomerWishlist: async (loggedInCustomerId: string) => {
      const ownerId = `gid://shopify/Customer/${loggedInCustomerId}`;
      const QUERY_CURRENT = `#graphql
        query CurrentWishlist($id: ID!) {
          customer(id: $id) {
            metafield(namespace: "custom", key: "wishlist") {
              type
              jsonValue
            }
          }
        }
      `;

      const currentRes = await admin.graphql(QUERY_CURRENT, {
        variables: { id: ownerId },
      });

      const currentJson = await currentRes.json();
      const wishlist = currentJson.data?.customer?.metafield?.jsonValue;
      if (Array.isArray(wishlist)) {
        return wishlist as string[];
      } else {
        return new Array<string>();
      }
    },
    updateCustomerWishlist: async (
      loggedInCustomerId: string,
      wishlist: string[],
    ) => {
      const ownerId = `gid://shopify/Customer/${loggedInCustomerId}`;
      const MUT_SET = `#graphql
            mutation SetWishlist($ownerId: ID!, $value: String!) {
              metafieldsSet(metafields: [{
                ownerId:$ownerId,
                namespace: "custom",
                key: "wishlist",
                type: "list.product_reference",
                value: $value
              }]) {
                metafields { id key namespace type }
                userErrors { field message code }
              }
            }
        `;
      const setRes = await admin.graphql(MUT_SET, {
        variables: { ownerId, value: JSON.stringify(wishlist) },
      });
      const setJson = await setRes.json();
      const errors = setJson?.data?.metafieldsSet?.userErrors;
      if (errors?.length) {
        throw new Error(
          `One or more errors occurred while updating customer wishlist (id='${loggedInCustomerId}'): ${JSON.stringify(errors)})`,
        );
      }
    },
  };
};

interface PostWishlistItemParams {
  productId: string;
  shop: string;
  loggedInCustomerId: string;
}

const getParams = (request: Request) => {
  const url = new URL(request.url);

  const productId = url.searchParams.get("productid");
  if (!productId) return http400("Missing productid");

  const shop = url.searchParams.get("shop");
  if (!shop) return http400("Missing shop");

  const loggedInCustomerId =
    url.searchParams.get("logged_in_customer_id") || "";
  if (!loggedInCustomerId) {
    console.warn("customer must be logged in to perform this action");
    return Response.json(
      { error: "Customer must be logged in" },
      { status: 401 },
    );
  }

  return {
    productId,
    shop,
    loggedInCustomerId,
  } as PostWishlistItemParams;
};

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    console.warn("method ", request.method, " not allowed");
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) {
    console.warn("app not installed");
    return Response.json(
      { error: "App not installed for this shop" },
      { status: 403 },
    );
  }

  const params = getParams(request);
  if (params instanceof Response) return params;

  try {
    const newProductId = `gid://shopify/Product/${params.productId}`;
    const service = customerService(admin);
    const wishlist = await service.getCustomerWishlist(
      params.loggedInCustomerId,
    );
    if (!wishlist.find((p) => p == newProductId)) {
      wishlist.push(newProductId);
            console.log(newProductId)
      await service.updateCustomerWishlist(params.loggedInCustomerId, wishlist);
      return Response.json({ message: "Added to wishlist!" });
    } else {
      return Response.json({
        message: "Product already exists in your wishlist.",
      });
    }
  } catch (e) {
    if (!(e instanceof Error))
      console.error("Unknown error occurred while inserting product");
    else if ((e as any)?.body?.errors)
      console.error(
        `Erorrs occurred while performing GraphQL query: ${JSON.stringify((e as any).body.errors)}`,
      );
    else
      console.error(
        "An error occurred while performing GraphQL query: ",
        e.message,
      );
    return Response.json(
      {
        message: "internal server error",
      },
      { status: 500 },
    );
  }
}
