import { KintoneRestAPIClient } from "@kintone/rest-api-client";

import { renderExecutionButton } from "./components/desktopUIHelpers";

// メイン処理
((PLUGIN_ID) => {
  kintone.events.on("app.record.index.show", async () => {
    const pluginConfig = kintone.plugin.app.getConfig(PLUGIN_ID).config;
    if (!pluginConfig) return;

    const restApiClient = new KintoneRestAPIClient();

    const handleAlertButtonClick = async () => {
      try {
        // 設定されたアプリからレコードを取得
      } catch (error) {
        console.error("Error:", error);
        alert("エラーが発生しました: " + error);
      }
    };

    renderExecutionButton(
      "alert-button",
      handleAlertButtonClick,
      "メッセージを表示",
    );
  });
})(kintone.$PLUGIN_ID);
