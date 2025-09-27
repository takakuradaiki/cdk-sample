// lib/codebuildStack.ts
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { CodeBuildProjects, CodeBuildProjectsProps } from "./resoures/codebuild";
import { CfnSubnet, CfnSecurityGroup } from "aws-cdk-lib/aws-ec2";

export interface CodeBuildStackProps extends StackProps {
  networkStack: {
    vpcId: string;
    cfnSubnets: Record<string, CfnSubnet>;
    cfnSecurityGroups: Record<string, CfnSecurityGroup>;
  };
  iamStack: {
    codeBuildIamRoleArn: string;
  };
}

export class CodeBuildStack extends Stack {
  public readonly codeBuildProjects: CodeBuildProjects;
  constructor(scope: Construct, id: string, props: CodeBuildStackProps) {
    super(scope, id, props);

    const buildCfg = config.get<CodeBuildProjectsProps>("codebuild.codebuildConfig");
    this.codeBuildProjects = new CodeBuildProjects(this, "CodeBuildProjects", {
      ...buildCfg,
      networkStack: props.networkStack,
      iamStack: {
        codeBuildIamRoleArn: props.iamStack.codeBuildIamRoleArn,
      },
    });
  }
}
