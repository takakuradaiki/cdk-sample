import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { Loadbalancer, LoadbalancerProps } from "./resoures/alb";

export interface AlbStackProps extends StackProps {
  networkStack: { vpcId: string; publicSubnetIds: string[]; albSecurityGroupId: string[] };
  certificateArn: string;
}
export class LoadbalancerStack extends Stack {
  public readonly loadbalancer: Loadbalancer;
  constructor(scope: Construct, id: string, props: AlbStackProps) {
    super(scope, id, props);
    const cfg = config.get<LoadbalancerProps>("alb.albConfig");
    this.loadbalancer = new Loadbalancer(this, "Loadbalancer", {
      ...cfg,
      networkStack: props.networkStack,
      certificateArn: props.certificateArn,
    });
  }
}
