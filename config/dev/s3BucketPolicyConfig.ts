// config/dev/s3BucketPolicyConfig.ts
import { Aws } from "aws-cdk-lib";
import { common } from "../common/dev-common";

export const s3BucketPolicyConfig = {
  cfnBucketPolicys: [
    // 複数形とすることで、将来的に複数のポリシーを設定できるように拡張可能
    {
      bucketName: common.s3.buckets.names.sample,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "DenyRequestsOverHttp",
            Effect: "Deny",
            Principal: "*",
            Action: "s3:*",
            Resource: [
              `arn:aws:s3:::${common.s3.buckets.names.sample}`,
              `arn:aws:s3:::${common.s3.buckets.names.sample}/*`,
            ],
            Condition: {
              Bool: { "aws:SecureTransport": "false" },
            },
          },
        ],
      },
    },
    {
      bucketName: common.s3.buckets.names.albLogs,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "elasticloadbalancing.amazonaws.com",
            },
            Action: ["s3:PutObjectAcl", "s3:PutObject"],
            Resource: `arn:aws:s3:::${common.s3.buckets.names.albLogs}/*`,
          },
          {
            Effect: "Allow",
            Principal: {
              AWS: "arn:aws:iam::582318560864:root",
            },
            Action: "s3:PutObject",
            Resource: `arn:aws:s3:::${common.s3.buckets.names.albLogs}/*`,
          },
        ],
      },
    },
    {
      bucketName: common.s3.buckets.names.codepipeline,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "DenyUnEncryptedObjectUploads",
            Effect: "Deny",
            Principal: {
              AWS: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/${common.iam.roles.names.codepipeline}`,
            },
            Action: "s3:PutObject",
            Resource: `arn:aws:s3:::${common.s3.buckets.names.codepipeline}/*`,
            Condition: {
              StringNotEquals: {
                "s3:x-amz-server-side-encryption": "aws:kms",
              },
            },
          },
          {
            Sid: "DenyInsecureConnections",
            Effect: "Deny",
            Principal: {
              AWS: `arn:aws:iam::${Aws.ACCOUNT_ID}:role/${common.iam.roles.names.codepipeline}`,
            },
            Action: "s3:*",
            Resource: `arn:aws:s3:::${common.s3.buckets.names.codepipeline}/*`,
            Condition: {
              Bool: {
                "aws:SecureTransport": "false",
              },
            },
          },
        ],
      },
    },
  ],
} as const;
