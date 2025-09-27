// config/dev/logGroupConfig.ts
export const logGroupConfig = {
  cfnLogGroups: [
    { name: "codebuild-logs", retentionInDays: 30 },
    { name: "log-router-logs", retentionInDays: 30 },

    { name: "admin-logs" },
    { name: "api-logs" },
    { name: "batch-logs" },
    { name: "bastion-host-logs" },
  ],
} as const;
