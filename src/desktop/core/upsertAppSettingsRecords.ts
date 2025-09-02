import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import type { ConfigSchema } from "../../shared/types/Config";
import type { KintoneEvent } from "src/shared/types/KintoneTypes";

export const upsertAppSettingsRecords = async (
  kintoneRestAPIClients: KintoneRestAPIClient,
  event: KintoneEvent,
  config: ConfigSchema,
) => {
  try {
    console.log("Fetching app settings...");
    console.log("event:", event);
    console.log("config:", config);
    const apps = (await kintoneRestAPIClients.app.getApps({})).apps;
    const appIds = apps.map((app) => app.appId);
    const processManagementResponse = await Promise.all(
      appIds.map((appId) =>
        kintoneRestAPIClients.app
          .getProcessManagement({ app: appId })
          .catch(() => null),
      ),
    );
    console.log("Apps fetched:", apps);
    console.log(
      "Process management responses fetched:",
      processManagementResponse,
    );
    await kintoneRestAPIClients.record.updateAllRecords({
      app: event.appId,
      upsert: true,
      records: makeRecordsForParameterOfApps(apps, config),
    });
  } catch (error) {
    console.error("Error fetching app settings:", error);
    throw error;
  }
};

/**
 * @description 複数のアプリ情報をupdateAllRecords用のパラメータに変換する純粋関数
 */
export const makeRecordsForParameterOfApps = (
  apps: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"],
  config: ConfigSchema,
  // getProcessManagementのレスポンスの配列と、その配列の各要素がappIdsに紐づいたオブジェクトの配列を追加する
): Parameters<
  KintoneRestAPIClient["record"]["updateAllRecords"]
>[0]["records"] => {
  return apps.map((app) => ({
    updateKey: {
      field: config.commonSetting.appId,
      value: app.appId,
    },
    record: {
      [config.commonSetting.name]: { value: app.name },
    },
  }));
};

/**
 * @description アプリIDの配列から、getProcessManagementのレスポンスの配列を取得し、IDとレスポンスを紐づけたオブジェクトの配列を返す純粋関数
 */
export const fetchProcessManagementResponses = async (
  kintoneRestAPIClients: KintoneRestAPIClient,
  appIds: number[],
): Promise<
  Array<{
    appId: number;
    response: Awaited<
      ReturnType<KintoneRestAPIClient["app"]["getProcessManagement"]>
    > | null;
  }>
> => {
  const responses = await Promise.all(
    appIds.map((appId) =>
      kintoneRestAPIClients.app
        .getProcessManagement({ app: appId })
        .catch(() => null),
    ),
  );
  return appIds.map((appId, index) => ({
    appId,
    response: responses[index],
  }));
};
