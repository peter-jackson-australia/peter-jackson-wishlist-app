export const responseBadRequest = (message: string): Response => {
  return new Response(JSON.stringify({ error: message }), { 
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
};

export const responseInternalServerError = (): Response => {
  return new Response(JSON.stringify({ error: "internal server error" }), { 
    status: 500,
    headers: { "Content-Type": "application/json" }
  });
};

export const responseMethodNotAllowed = (): Response => {
  return new Response(JSON.stringify({ error: "method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" }
  });
};

export const responseProductAlreadyInWishlist = (): Response => {
  return new Response(JSON.stringify({
    message: "Product already exists in your wishlist.",
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

export const responseAddedToWishlist = (): Response => {
  return new Response(JSON.stringify({ message: "added to wishlist" }), { 
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

export const responseDeletedFromWishlist = (): Response => {
  return new Response(JSON.stringify({ message: "removed from wishlist" }), { 
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

export const responseProductNotInWishlist = (): Response => {
  return new Response(JSON.stringify(
    { message: "product with specified id not found in wishlist" }
  ), { 
    status: 400,
    headers: { "Content-Type": "application/json" }
  });
};
