import { Locale } from "./locale";
import enUS from "./en";

//Simplified Chinese - 简体中文
export const zhCN: Locale = {
  Settings: {
    RegularOptions: {
      CleanedFiles: {
        Label: "清理文件",
        Description: "要如何处理已清理的文件？",

        Options: {
          MoveToSystemTrash: "移至系统回收站",
          MoveToObsidianTrash: "移至软件回收站（.trash 文件夹）",
          PermanentDelete: "永久删除",
        },
      },

      ExcludedFolders: {
        Label: "排除文件夹",
        Description: `
          排除文件夹中的文件将不会被清理。
          路径区分大小写，每个路径由换行符分隔。`,
        Placeholder: "示例：\n文件夹/子文件夹\n文件夹2/子文件夹2",
      },
    },
  },

  Buttons: {
    CleanFiles: "清理文件",
  },

  Notifications: {
    CleanSuccessful: "清理成功",
    NoFileToClean: "没有文件需要清理",
  },

  // The following is used as a fallback in case a translation is missing.
  ...enUS,
};

export default zhCN;
