import { CfnBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
export interface S3BucketProps {
  cfnBuckets: [
    {
      bucketName: string;
      versioningConfiguration: {
        status: string;
      };
      publicAccessBlockConfiguration: {
        blockPublicAcls: boolean;
        ignorePublicAcls: boolean;
        blockPublicPolicy: boolean;
        restrictPublicBuckets: boolean;
      };
      accessControl: string;
      tags: { key: string; value: string }[];
    }
  ];
  defaultEncryptionKeyAlias: string;
}

export class S3Bucket extends Construct {
  public readonly cfnBuckets: Record<string, CfnBucket> = {};

  constructor(scope: Construct, id: string, props: S3BucketProps) {
    super(scope, id);

    props.cfnBuckets.forEach((cfnBucket) => {
      this.cfnBuckets[cfnBucket.bucketName] = new CfnBucket(this, cfnBucket.bucketName, {
        bucketName: cfnBucket.bucketName,
        versioningConfiguration: cfnBucket.versioningConfiguration,
        publicAccessBlockConfiguration: cfnBucket.publicAccessBlockConfiguration,
        accessControl: cfnBucket.accessControl,
        tags: cfnBucket.tags,
        bucketEncryption: {
          serverSideEncryptionConfiguration: [
            {
              serverSideEncryptionByDefault: {
                sseAlgorithm: "aws:kms",
                kmsMasterKeyId: props.defaultEncryptionKeyAlias,
              },
            },
          ],
        },
      });
    });
  }
}
