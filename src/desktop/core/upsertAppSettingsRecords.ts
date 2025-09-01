import { KintoneRestAPIClient } from "@kintone/rest-api-client";

export const upsertAppSettingsRecords = async (
  kintoneRestAPIClients: KintoneRestAPIClient,
) => {
  try {
    await kintoneRestAPIClients.app.getApps({});
  } catch (error) {
    console.error("Error fetching app settings:", error);
    throw error;
  }
};
