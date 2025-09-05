import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import {
  fetchAppFormFields,
  fetchAppProcessSettings,
} from "./syncAppSettingsToKintone";

import type { AppSettingsApiResponses } from "./syncAppSettingsToKintone";
import type { ConfigSchema } from "../../shared/types/Config";
import type { AppRecordDetailShowEvent } from "../../shared/types/KintoneTypes";

export const syncSingleAppSettingToKintone = async (
  kintoneClient: KintoneRestAPIClient,
  event: AppRecordDetailShowEvent,
  config: ConfigSchema,
) => {
  try {
    // event.record から対象アプリIDを取得
    const targetAppId = event.record[config.commonSetting.appId]
      ?.value as string;
    if (!targetAppId) {
      throw new Error("Target app ID not found in record");
    }

    // アプリ設定を取得
    const apiResponses: AppSettingsApiResponses = {};

    if (config.commonSetting.getProcessManagementResponse) {
      apiResponses.processManagement = await fetchAppProcessSettings(
        kintoneClient,
        [targetAppId],
      );
    }

    if (config.commonSetting.getFormFieldsResponse) {
      apiResponses.formFields = await fetchAppFormFields(kintoneClient, [
        targetAppId,
      ]);
    }

    // 設定に応じてレスポンスフィールドを更新
    const updateRecord: Record<string, { value: string }> = {};

    if (
      apiResponses.processManagement &&
      config.commonSetting.getProcessManagementResponse
    ) {
      const processSettings = apiResponses.processManagement.find(
        (pm) => pm.appId === targetAppId,
      );
      updateRecord[config.commonSetting.getProcessManagementResponse] = {
        value: JSON.stringify(processSettings?.response || null),
      };
    }

    if (apiResponses.formFields && config.commonSetting.getFormFieldsResponse) {
      const formFieldsSettings = apiResponses.formFields.find(
        (ff) => ff.appId === targetAppId,
      );
      updateRecord[config.commonSetting.getFormFieldsResponse] = {
        value: JSON.stringify(formFieldsSettings?.response || null),
      };
    }

    // レコードを更新
    await kintoneClient.record.updateRecord({
      app: event.appId.toString(),
      id: event.recordId.toString(),
      record: updateRecord,
    });
  } catch (error) {
    console.error("Error updating single app setting:", error);
    throw error;
  }
};
