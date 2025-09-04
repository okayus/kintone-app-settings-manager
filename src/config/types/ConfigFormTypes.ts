import type { ConfigSchema } from "../../shared/types/Config";
import type { KintoneUtil } from "../../shared/util/KintoneUtil";

export interface ConfigFormState {
  formData: ConfigSchema;
  currentTab: number;
}

export interface ConfigFormProps {
  pluginId: string;
  kintoneUtil: typeof KintoneUtil;
}

export interface FileOperationResult {
  success: boolean;
  data?: ConfigSchema;
  error?: string;
}

// ValidationResult は KintoneTypes.ts から再エクスポート
export type { ValidationResult } from "../../shared/types/KintoneTypes";
