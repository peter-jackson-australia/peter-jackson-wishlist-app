export const responseBadRequest = (message: string): Response => {
  return Response.json({ error: message }, { status: 400 });
};

export const responseInternalServerError = (): Response => {
  return Response.json({ error: "internal server error" }, { status: 500 });
};

export const responseMethodNotAllowed = (): Response => {
  return Response.json({ error: "method not allowed" });
};

export const responseProductAlreadyInWishlist = (): Response => {
  return Response.json({
    message: "Product already exists in your wishlist.",
  });
};

export const responseAddedToWishlist = (): Response => {
  return Response.json({ message: "added to wishlist" }, { status: 201 });
};

export const responseDeletedFromWishlist = (): Response => {
  return Response.json({ message: "removed from wishlist" }, { status: 201 });
};

export const responseProductNotInWishlist = (): Response => {
  return Response.json(
    { message: "product with specified id not found in wishlist" },
    { status: 400 },
  );
};
