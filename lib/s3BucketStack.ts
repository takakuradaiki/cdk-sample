import { StackProps, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { S3Bucket, S3BucketProps } from "./resoures/s3Bucket";
import config = require("config");
import { S3BucketPolicy } from "./resoures/s3BucketPolicy";

export interface S3StackProps extends StackProps {}

export class S3BucketStack extends Stack {
  public readonly s3Bucket: S3Bucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);
    this.s3Bucket = new S3Bucket(this, "S3Bucket", config.get<S3BucketProps>("s3Bucket.s3BucketConfig"));
    const status3BucketPolicy = new S3BucketPolicy(
      this,
      "S3BucketPolicy",
      config.get("s3Bucket.s3BucketPolicyConfig")
    );
    // 依存関係
    status3BucketPolicy.node.addDependency(this.s3Bucket);
  }
}
