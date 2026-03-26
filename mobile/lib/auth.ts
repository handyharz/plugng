import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "plugng_auth_token";

export async function getAuthToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setAuthToken(token: string) {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuthToken() {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

