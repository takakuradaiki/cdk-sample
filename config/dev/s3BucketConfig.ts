// config/dev/s3BucketConfig.ts
import { common } from "../common/dev-common";

export const s3BucketConfig = {
  cfnBuckets: [
    // 複数形とすることで、将来的に複数のバケットを設定できるように拡張可能
    {
      bucketName: common.s3.buckets.names.sample,
      versioningConfiguration: { status: "Enabled" },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      },
      accessControl: "Private",
      tags: [
        { key: "Name", value: common.s3.buckets.names.sample },
        { key: "Environment", value: "dev" },
      ],
    },
    {
      bucketName: common.s3.buckets.names.backend,
      versioningConfiguration: { status: "Enabled" },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      },
      accessControl: "Private",
      tags: [
        { key: "Name", value: common.s3.buckets.names.backend },
        { key: "Environment", value: "dev" },
      ],
    },
    {
      bucketName: common.s3.buckets.names.albLogs,
      versioningConfiguration: { status: "Enabled" },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      },
      accessControl: "Private",
      tags: [
        { key: "Name", value: common.s3.buckets.names.albLogs },
        { key: "Environment", value: "dev" },
      ],
    },
    {
      bucketName: common.s3.buckets.names.sessionManagerLog,
      versioningConfiguration: { status: "Enabled" },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      },
      accessControl: "Private",
      tags: [
        { key: "Name", value: common.s3.buckets.names.sessionManagerLog },
        { key: "Environment", value: "dev" },
      ],
    },
    {
      bucketName: common.s3.buckets.names.codepipeline,
      versioningConfiguration: { status: "Enabled" },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: true,
        restrictPublicBuckets: true,
      },
      accessControl: "Private",
      tags: [
        { key: "Name", value: common.s3.buckets.names.codepipeline },
        { key: "Environment", value: "dev" },
      ],
    },
  ],

  // デフォルト暗号化キー
  defaultEncryptionKeyAlias: "alias/aws/s3",
} as const;
