import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import type { ConfigSchema } from "../../shared/types/Config";
import type { KintoneEvent } from "src/shared/types/KintoneTypes";

/**
 * @description kintone APIから取得した各レスポンスを管理するインターフェース
 */
interface AppSettingsApiResponses {
  processManagement?: Awaited<ReturnType<typeof fetchAppProcessSettings>>;
  // 将来追加予定: formFields, views, customize, etc.
}

/**
 * @description フィールドデータ生成関数の型定義
 */
type FieldDataCreator = (
  app: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"][0],
  apiResponses: AppSettingsApiResponses,
  config: ConfigSchema,
) => Record<string, { value: string }>;

export const syncAppSettingsToKintone = async (
  kintoneClient: KintoneRestAPIClient,
  event: KintoneEvent,
  config: ConfigSchema,
) => {
  try {
    const apps = (await kintoneClient.app.getApps({})).apps;
    const appIds = apps.map((app) => app.appId);

    // 各種レスポンスを並行して取得（設定に基づいて条件分岐）
    const apiResponses: AppSettingsApiResponses = {};

    if (config.commonSetting.getProcessManagementResponse) {
      apiResponses.processManagement = await fetchAppProcessSettings(
        kintoneClient,
        appIds,
      );
    }

    // 将来的に追加される他のレスポンス取得処理
    // if (config.commonSetting.getFormFieldsResponse) {
    //   responses.formFields = await fetchFormFields(kintoneRestAPIClients, appIds);
    // }

    await kintoneClient.record.updateAllRecords({
      app: event.appId,
      upsert: true,
      records: buildUpdateRecords(apps, apiResponses, config),
    });
  } catch (error) {
    console.error("Error fetching app settings:", error);
    throw error;
  }
};

/**
 * @description アプリと各種レスポンスからレコードフィールドを動的に生成するヘルパー関数
 */
const createFieldData = (
  app: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"][0],
  apiResponses: AppSettingsApiResponses,
  config: ConfigSchema,
): Record<string, { value: string }> => {
  const recordFields: Record<string, { value: string }> = {
    [config.commonSetting.name]: { value: app.name },
  };

  // プロセス管理レスポンスの処理
  if (
    apiResponses.processManagement &&
    config.commonSetting.getProcessManagementResponse
  ) {
    const processSettings = apiResponses.processManagement.find(
      (pm) => pm.appId === app.appId,
    );
    recordFields[config.commonSetting.getProcessManagementResponse] = {
      value: JSON.stringify(processSettings?.response || null),
    };
  }

  // 将来的には他のレスポンス処理もここに追加
  // if (responses.formFields && config.commonSetting.getFormFieldsResponse) { ... }
  // if (responses.views && config.commonSetting.getViewsResponse) { ... }

  return recordFields;
};

/**
 * @description レコード生成の高階関数
 * フィールドデータ作成関数を注入可能にすることで、テスト容易性と拡張性を向上
 */
const createRecordBuilder =
  (fieldCreator: FieldDataCreator = createFieldData) =>
  (
    apps: Awaited<ReturnType<KintoneRestAPIClient["app"]["getApps"]>>["apps"],
    apiResponses: AppSettingsApiResponses,
    config: ConfigSchema,
  ): Parameters<
    KintoneRestAPIClient["record"]["updateAllRecords"]
  >[0]["records"] =>
    apps.map((app) => ({
      updateKey: {
        field: config.commonSetting.appId,
        value: app.appId,
      },
      record: fieldCreator(app, apiResponses, config),
    }));

/**
 * @description デフォルトのレコード構築関数
 */
export const buildUpdateRecords = createRecordBuilder();

/**
 * @description アプリIDの配列から、getProcessManagementのレスポンスの配列を取得し、IDとレスポンスを紐づけたオブジェクトの配列を返す純粋関数
 */
export const fetchAppProcessSettings = async (
  kintoneClient: KintoneRestAPIClient,
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
      kintoneClient.app.getProcessManagement({ app: appId }).catch(() => null),
    ),
  );
  return appIds.map((appId, index) => ({
    appId,
    response: responses[index],
  }));
};
