// lib/ssmParamsStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { SsmParams, type SsmParamsProps } from "./resoures/ssmParams";

export class SsmParamsStack extends Stack {
  public readonly ssm: SsmParams;
  public readonly refs: { ssm: { parameterNames: string[] } };

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cfg = config.get<SsmParamsProps>("ssmParams.ssmParamsConfig");
    this.ssm = new SsmParams(this, "SsmParams", cfg);

    this.refs = {
      ssm: { parameterNames: Object.keys(this.ssm.parametersByName) },
    };
  }
}
