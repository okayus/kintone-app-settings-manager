import {
  isCurrentConfigSchema,
  isLegacyConfigV1,
  isLegacyConfigV2,
  isValidConfigObject,
  type LegacyConfig,
} from "../types/LegacyConfigTypes";

import type { ConfigSchema } from "../../shared/types/Config";

/**
 * 現在のタブインデックスを調整する純粋関数
 */
export const adjustCurrentTab = (
  currentTab: number,
  settingsLength: number,
): number => {
  if (currentTab >= settingsLength && currentTab > 0) {
    return currentTab - 1;
  }
  return currentTab;
};

/**
 * 新しいタブのインデックスを計算する純粋関数
 */
export const calculateNewTabIndex = (settingsLength: number): number =>
  settingsLength;

/**
 * 共通設定のデフォルト値を生成する純粋関数
 */
export const createDefaultCommonSetting = () => ({
  appId: "",
  getProcessManagementResponse: "",
});

/**
 * レガシー設定データを新形式に変換する純粋関数
 * 型ガードを使用して安全に変換を行う
 *
 * 【なぜこの実装なのか】
 */
export const convertLegacyConfig = (
  parsedConfig: LegacyConfig,
): ConfigSchema => {
  // 未知の形式の場合はデフォルト値を返す
  return {
    commonSetting: createDefaultCommonSetting(),
  };
};

/**
 * 保存用の設定データを作成する純粋関数
 */
export const createSaveConfig = (formData: ConfigSchema) => ({
  config: formData,
});
