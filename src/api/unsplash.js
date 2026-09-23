import axios from "axios";

const unsplashClient = axios.create({
  baseURL: "https://api.unsplash.com",
  headers: {
    Authorization: `Client-ID ${process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY}`,
  },
});

export const fetchWallpapers = (page = 1) =>
  unsplashClient.get("/photos", { params: { per_page: 30, page } });

export const getWallpaperById = (id) => unsplashClient.get(`/photos/${id}`);

export default unsplashClient;
