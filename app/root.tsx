import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "./shopify.server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";
import { responseBadRequest, responseMethodNotAllowed, responseInternalServerError, responseProductAlreadyInWishlist, responseAddedToWishlist  } from "./util/util";

const customerService = (admin: AdminApiContextWithoutRest) => {
  return {
    getCustomerWishlist: async (loggedInCustomerId: string) => {
      const ownerId = `gid://shopify/Customer/${loggedInCustomerId}`;
      const QUERY_CURRENT = `#graphql
        query CurrentWishlist($id: ID!) {
          customer(id: $id) {
            metafield(namespace: "custom", key: "wishlist") {
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
  if (!productId) return responseBadRequest("Missing productid");

  const shop = url.searchParams.get("shop");
  if (!shop) return responseBadRequest("Missing shop");

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
  switch (request.method) {
    case "POST":
      return await postAction(request);
    case "DELETE":
      return await deleteAction(request);
    default:
      console.warn("method ", request.method, " not allowed");
      return Response.json(responseMethodNotAllowed);
  }
}

const postAction = async (request: Request): Promise<Response> => {
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
      await service.updateCustomerWishlist(params.loggedInCustomerId, wishlist);
      return responseAddedToWishlist();
    } else {
      return responseProductAlreadyInWishlist();
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
    return responseInternalServerError();
  }
};

const deleteAction = async (request: Request): Promise<Response> => {
  return Response.json({
    message: "ok",
  });
};
