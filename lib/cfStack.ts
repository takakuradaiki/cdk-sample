import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { CloudFrontResources, type CloudFrontConfig } from "./resoures/cloudfront";

export interface CfStackProps extends StackProps {
  certArnsByKey: Record<string, string>; // { cfCertArn: "arn:..." }（cf用 ACM）
}

export class CfStack extends Stack {
  public readonly cf: CloudFrontResources;

  constructor(scope: Construct, id: string, props: CfStackProps) {
    super(scope, id, props);

    const cfg = config.get<CloudFrontConfig>("cloudfront.cloudfrontConfig");

    this.cf = new CloudFrontResources(this, "CloudFront", {
      ...cfg,
      certArnsByKey: props.certArnsByKey,
    });
  }
}
