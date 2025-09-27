import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import { CfnSubnet, CfnSecurityGroup } from "aws-cdk-lib/aws-ec2";
type EnvVar = { name: string; value: string };

export interface CodeBuildProjectsProps {
  networkStack: {
    vpcId: string;
    cfnSubnets: Record<string, CfnSubnet>;
    cfnSecurityGroups: Record<string, CfnSecurityGroup>;
  };
  iamStack: {
    codeBuildIamRoleArn: string;
  };
  cfnCodeBuildProjects: Array<{
    name: string;
    description: string;
    artifacts: { type: string };
    timeoutInMinutes?: number;
    queuedTimeoutInMinutes?: number;
    cache: { type: string; modes: string[] };
    environment: {
      image: string;
      type: string;
      computeType: string;
      env: EnvVar[];
      privilegedMode: boolean;
      imagePullCredentialsType: string;
    };
    cloudWatchLogs?: { groupName: string; streamName: string; status: string };
    source: { type: string; buildspec: string };
    vpcConfig?: {
      subnets: string[];
      securityGroupIds: string[];
    };
  }>;
}

export class CodeBuildProjects extends Construct {
  public cfnProjects: Record<string, codebuild.CfnProject> = {};

  constructor(scope: Construct, id: string, props: CodeBuildProjectsProps) {
    super(scope, id);

    props.cfnCodeBuildProjects.forEach((cfg) => {
      this.cfnProjects[cfg.name] = new codebuild.CfnProject(this, cfg.name, {
        name: cfg.name,
        description: cfg.description,
        serviceRole: props.iamStack.codeBuildIamRoleArn,
        artifacts: cfg.artifacts,
        cache: cfg.cache,
        environment: cfg.environment,
        logsConfig: {
          cloudWatchLogs: cfg.cloudWatchLogs,
        },
        source: cfg.source,
        timeoutInMinutes: cfg.timeoutInMinutes,
        queuedTimeoutInMinutes: cfg.queuedTimeoutInMinutes,
        vpcConfig: cfg.vpcConfig
          ? {
              vpcId: props.networkStack.vpcId,
              subnets: cfg.vpcConfig.subnets.map((subnet) => props.networkStack.cfnSubnets[subnet].ref),
              securityGroupIds: cfg.vpcConfig.securityGroupIds.map(
                (sg) => props.networkStack.cfnSecurityGroups[sg].ref
              ),
            }
          : undefined,
      });
    });
  }
}
