import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import {
  renderExecutionButton,
  renderRecordDetailButton,
} from "./components/desktopUIHelpers";
import { syncAppSettingsToKintone } from "./core/syncAppSettingsToKintone";
import { syncSingleAppSettingToKintone } from "./core/syncSingleAppSettingToKintone";

import type { ConfigSchema } from "src/shared/types/Config";
import type {
  AppRecordDetailShowEvent,
  KintoneEvent,
} from "src/shared/types/KintoneTypes";

((PLUGIN_ID) => {
  // 共通の設定取得処理
  const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID).config;
  if (!pluginConfig) return;
  const config = JSON.parse(pluginConfig).config as ConfigSchema;
  const restApiClient = new KintoneRestAPIClient();

  // 既存: レコード一覧画面
  kintone.events.on("app.record.index.show", async (event: KintoneEvent) => {
    renderExecutionButton(
      "alert-button",
      () => syncAppSettingsToKintone(restApiClient, event, config),
      "アプリ設定を取得",
    );
  });

  // 新規: レコード詳細画面
  kintone.events.on(
    "app.record.detail.show",
    (event: AppRecordDetailShowEvent) => {
      const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();
      if (!headerSpace) return event;

      renderRecordDetailButton(
        "record-detail-button",
        async () => {
          await syncSingleAppSettingToKintone(restApiClient, event, config);
        },
        "プロセス管理設定を更新",
        headerSpace,
      );

      return event;
    },
  );
})(kintone.$PLUGIN_ID);
