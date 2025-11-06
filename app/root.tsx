import { authenticate } from "./shopify.server";

// Helper: make product GID
const toProductGID = (numericId: string) =>
  `gid://shopify/Product/${numericId}`;

const http400 = (message: string): Response => {
  return Response.json({ error: message }, { status: 400 });
};

export async function action({ request }: any) {
  console.log("performing action");

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

  console.log(
    "recieved POST request: user: ",
    loggedInCustomerId,
    ", shop: ",
    shop,
  );
  return Response.json({ message: "success" });
}
