// config/dev/rdsConfig.ts
import { common } from "../common/dev-common";

export const rdsConfig = {
  cfnDBCluster: {
    identifier: "aurora-cluster",
    engine: "aurora-mysql",
    engineVersion: "8.0.mysql_aurora.3.08.0",
    databaseName: "app",
    masterUsername: "admin",
    // 運用系
    backupRetention: 5,
    preferredBackupWindow: "19:00-20:00",
    preferredMaintenanceWindow: "sun:20:00-sun:21:00",
    deletionProtection: false,
    storageEncrypted: true,
    performanceInsights: true,

    tags: [{ key: "Name", value: "aurora-cluster" }],
  },

  cfnWriterDBInstance: {
    identifier: "aurora-writer-instance",
    instanceClass: "db.t3.medium",
    az: common.network.azs.a,
  },
  cfnReaderDBInstance: {
    identifier: "aurora-reader-instance",
    instanceClass: "db.t3.medium",
    az: common.network.azs.c,
  },
} as const;
