export const routePaths = {
  home: "/",
  auth: "/auth",
  catalog: "/catalog",
  plantDetails: (id = ":id") => `/plants/${id}`,
  dashboard: "/cabinet",
  newFlowerbed: "/flowerbeds/new",
  flowerbed: (id = ":id") => `/flowerbeds/${id}`,
} as const;
