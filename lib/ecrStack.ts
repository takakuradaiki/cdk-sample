import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { EcrResources, EcrConfigProps } from "./resoures/ecr";

export class EcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cfg = config.get<EcrConfigProps>("ecr.ecrConfig");
    const res = new EcrResources(this, "Ecr", cfg);
  }
}
