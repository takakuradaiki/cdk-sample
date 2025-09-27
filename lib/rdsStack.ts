// lib/rdsStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { Rds, type RdsProps } from "./resoures/rds";

export interface RdsStackProps extends StackProps {
  networkStack: {
    dbSubnetIds: string[];
    dbsecurityGroupId: string[];
  };
  configKey?: string;
}

export class RdsStack extends Stack {
  public readonly Rds: Rds;

  constructor(scope: Construct, id: string, props: RdsStackProps) {
    super(scope, id, props);

    this.Rds = new Rds(this, "Rds", {
      ...config.get<RdsProps>("rds.rdsConfig"),
      networkStack: props.networkStack,
    });
  }
}
