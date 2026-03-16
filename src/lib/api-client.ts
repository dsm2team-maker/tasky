// Configuration du client API avec gestion des tokens JWT
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Routes d'auth qui ne doivent PAS déclencher la déconnexion sur 401
const AUTH_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

const isAuthRoute = (url?: string) =>
  AUTH_ROUTES.some((route) => url?.includes(route));

// Instance Axios principale
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Intercepteur pour ajouter le token JWT aux requêtes
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercepteur pour gérer les erreurs 401 (token expiré)
// ⚠️ Exclure les routes d'auth pour ne pas fermer les modals
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url;
    const status = error.response?.status;

    // Ne déconnecter que si c'est un 401 sur une route protégée
    if (status === 401 && !isAuthRoute(url)) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  },
);

// Instance pour les uploads de fichiers
export const apiClientUpload: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  timeout: 30000,
});

apiClientUpload.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Helper pour gérer les erreurs
export const handleApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || "Une erreur est survenue",
      errors: error.response.data.errors,
      statusCode: error.response.status,
    };
  }
  return {
    message: error.message || "Erreur réseau. Vérifiez votre connexion.",
    statusCode: 500,
  };
};
