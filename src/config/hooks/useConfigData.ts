import { useState } from "react";

import {
  adjustCurrentTab,
  calculateNewTabIndex,
  createDefaultCommonSetting,
} from "../utils/configUtils";

import type { ConfigSchema } from "../../shared/types/Config";
import type { ConfigFormState } from "../types/ConfigFormTypes";

export const useConfigData = (
  initialData: ConfigSchema = {
    commonSetting: createDefaultCommonSetting(),
  },
) => {
  const [formData, setFormData] = useState<ConfigSchema>(initialData);
  const [currentTab, setCurrentTab] = useState(0);

  const state: ConfigFormState = {
    formData,
    currentTab,
  };

  const actions = {
    setFormData,
    setCurrentTab,

    handleTabChange: (_: React.SyntheticEvent, newValue: number) => {
      setCurrentTab(newValue);
    },

    handleUpdateCommonSetting: (
      commonSettingData: ConfigSchema["commonSetting"],
    ) => {
      const newFormData: ConfigSchema = commonSettingData
        ? { ...formData, commonSetting: commonSettingData }
        : { ...formData };
      setFormData(newFormData);
    },
  };

  return {
    state,
    actions,
  };
};
