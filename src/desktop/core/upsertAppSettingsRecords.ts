import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import type { ConfigSchema } from "../../shared/types/Config";
import type { KintoneEvent } from "src/shared/types/KintoneTypes";

/**
 * @description kintone APIから取得した各レスポンスを管理するインターフェース
 */
interface KintoneResponseCollection {
  processManagement?: Awaited<
    ReturnType<typeof fetchProcessManagementResponses>
  >;
  // 将来追加予定: formFields, views, customize, etc.
}

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

    // 各種レスポンスを並行して取得（設定に基づいて条件分岐）
    const responses: KintoneResponseCollection = {};

    if (config.commonSetting.getProcessManagementResponse) {
      responses.processManagement = await fetchProcessManagementResponses(
        kintoneRestAPIClients,
        appIds,
      );
      console.log(
        "Process management responses fetched:",
        responses.processManagement,
      );
    }

    // 将来的に追加される他のレスポンス取得処理
    // if (config.commonSetting.getFormFieldsResponse) {
    //   responses.formFields = await fetchFormFields(kintoneRestAPIClients, appIds);
    // }

    console.log("Apps fetched:", apps);

    await kintoneRestAPIClients.record.updateAllRecords({
      app: event.appId,
      upsert: true,
      records: makeRecordsForParameterOfApps(apps, responses, config),
    });
  } catch (error) {
    console.error("Error fetching app settings:", error);
    throw error;
  }
};

/**
 * @description アプリと各種レスポンスからレコードフィールドを動的に生成するヘルパー関数
 */
const buildRecordFields = (
  app: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"][0],
  responses: KintoneResponseCollection,
  config: ConfigSchema,
): Record<string, { value: string }> => {
  const fields: Record<string, { value: string }> = {
    [config.commonSetting.name]: { value: app.name },
  };

  // プロセス管理レスポンスの処理
  if (
    responses.processManagement &&
    config.commonSetting.getProcessManagementResponse
  ) {
    const processManagementData = responses.processManagement.find(
      (pm) => pm.appId === app.appId,
    );
    fields[config.commonSetting.getProcessManagementResponse] = {
      value: JSON.stringify(processManagementData?.response || null),
    };
  }

  // 将来的には他のレスポンス処理もここに追加
  // if (responses.formFields && config.commonSetting.getFormFieldsResponse) { ... }
  // if (responses.views && config.commonSetting.getViewsResponse) { ... }

  return fields;
};

/**
 * @description 複数のアプリ情報をupdateAllRecords用のパラメータに変換する純粋関数
 */
export const makeRecordsForParameterOfApps = (
  apps: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"],
  responses: KintoneResponseCollection,
  config: ConfigSchema,
): Parameters<
  KintoneRestAPIClient["record"]["updateAllRecords"]
>[0]["records"] => {
  return apps.map((app) => ({
    updateKey: {
      field: config.commonSetting.appId,
      value: app.appId,
    },
    record: buildRecordFields(app, responses, config),
  }));
};

/**
 * @description アプリIDの配列から、getProcessManagementのレスポンスの配列を取得し、IDとレスポンスを紐づけたオブジェクトの配列を返す純粋関数
 */
export const fetchProcessManagementResponses = async (
  kintoneRestAPIClients: KintoneRestAPIClient,
  appIds: string[],
): Promise<
  Array<{
    appId: string;
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
