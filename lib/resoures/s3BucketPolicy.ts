import { CfnBucket, CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
export interface S3BucketPolicyProps {
  cfnBucketPolicys: {
    bucketName: string;
    policyDocument: {
      Version: string;
      Statement: Array<{
        Sid?: string;
        Effect: string;
        Principal: string | { AWS: string };
        Action: string | string[];
        Resource: string | string[];
        Condition?: Record<string, any>;
      }>;
    };
  }[];
}

export class S3BucketPolicy extends Construct {
  public readonly s3Buckets: CfnBucket;

  constructor(scope: Construct, id: string, props: S3BucketPolicyProps) {
    super(scope, id);

    props.cfnBucketPolicys.forEach((cfnBucketPolicy) => {
      new CfnBucketPolicy(this, cfnBucketPolicy.bucketName, {
        bucket: cfnBucketPolicy.bucketName,
        policyDocument: cfnBucketPolicy.policyDocument,
      });
    });
  }
}
