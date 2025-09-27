// config/dev/ecrConfig.ts

import { common } from "../common/dev-common";

export const ecrConfig = {
  cfnRepositories: [
    {
      repositoryName: common.ecr.repositories.names.admin,
      imageTagMutability: "MUTABLE",
      scanOnPush: true,
      lifecycle: { maxImageCount: 3 },
    },
    {
      repositoryName: common.ecr.repositories.names.api,
      imageTagMutability: "MUTABLE",
      scanOnPush: true,
      lifecycle: { maxImageCount: 3 },
    },
    {
      repositoryName: common.ecr.repositories.names.batch,
      imageTagMutability: "MUTABLE",
      scanOnPush: true,
      lifecycle: { maxImageCount: 3 },
    },
    {
      repositoryName: common.ecr.repositories.names.phpcli,
      imageTagMutability: "MUTABLE",
      scanOnPush: true,
      lifecycle: { maxImageCount: 3 },
    },
    {
      repositoryName: common.ecr.repositories.names.apiWeb,
      imageTagMutability: "MUTABLE",
      scanOnPush: true,
      lifecycle: { maxImageCount: 3 },
    },
  ],
} as const;
