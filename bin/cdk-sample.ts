#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { S3BucketStack } from "../lib/s3BucketStack";
import { NetworkStack } from "../lib/networkStack";
import { EcrStack } from "../lib/ecrStack";
import { LoadbalancerStack } from "../lib/albStack";
import { AcmStack } from "../lib/acmStack";
import { EcsStack } from "../lib/ecsStack";
import { LogsStack } from "../lib/logsStack";
import { IamStack } from "../lib/iamStack";
import { Route53Stack } from "../lib/route53Stack";
import { SsmParamsStack } from "../lib/ssmParamsStack";
import { RdsStack } from "../lib/rdsStack";
import { CodeBuildStack } from "../lib/codebuildStack";
import { CodePipelineStack } from "../lib/codepipelineStack";
import { common } from "../config/common/dev-common";

const app = new cdk.App();

if (process.env.NODE_ENV === "dev") {
  // 開発環境
  const env = { account: "491192276465", region: "us-east-2" }; // オハイオ
  const devCommon = common;

  // 各スタック生成
  const iamStack = new IamStack(app, "devIamStack", { env: env });
  const s3BucketStack = new S3BucketStack(app, "devS3BucketStack", { env: env });
  s3BucketStack.node.addDependency(iamStack);

  const networkStack = new NetworkStack(app, "devNetworkStack", { env: env });

  const acmStack = new AcmStack(app, "AcmStack", { env: env });

  const loadbalancerStack = new LoadbalancerStack(app, "devLoadbalancerStack", {
    env: env,
    networkStack: {
      vpcId: networkStack.Network.cfnVPC.ref,
      publicSubnetIds: [
        networkStack.Network.cfnSubnets[devCommon.network.subnets.names.publicA].ref,
        networkStack.Network.cfnSubnets[devCommon.network.subnets.names.publicC].ref,
      ],
      albSecurityGroupId: [networkStack.Network.cfnSecurityGroups[common.network.securityGroups.names.alb].ref],
    },
    certificateArn: acmStack.certArn,
  });

  new EcrStack(app, "devEcrStack", { env: env });

  new LogsStack(app, "devLogsStack", { env: env });

  new Route53Stack(app, "devRoute53Stack", {
    env: env,
    crossRegionReferences: true,
    loadbalancerStack: {
      dnsName: loadbalancerStack.loadbalancer.cfnLoadBalancer.attrDnsName,
      hostedZoneId: loadbalancerStack.loadbalancer.cfnLoadBalancer.attrCanonicalHostedZoneId,
    },
  });

  // const rdsStack = new RdsStack(app, "devRdsStack", {
  //   env: env,
  //   networkStack: {
  //     dbSubnetIds: [
  //       networkStack.Network.cfnSubnets[devCommon.network.subnets.names.dbA].ref,
  //       networkStack.Network.cfnSubnets[devCommon.network.subnets.names.dbC].ref,
  //     ],
  //     dbsecurityGroupId: [networkStack.Network.cfnSecurityGroups[common.network.securityGroups.names.db].ref],
  //   },
  // });
  // rdsStack.addDependency(networkStack);

  new SsmParamsStack(app, "devSsmParamsStack", { env: env });

  const codeBuildStack = new CodeBuildStack(app, "devCodeBuildStack", {
    env: env,
    networkStack: {
      vpcId: networkStack.Network.cfnVPC.ref,
      cfnSubnets: networkStack.Network.cfnSubnets,
      cfnSecurityGroups: networkStack.Network.cfnSecurityGroups,
    },
    iamStack: {
      codeBuildIamRoleArn: iamStack.roles.iamRoles[common.iam.roles.names.codebuild].roleArn,
    },
  });
  const codePipelineStack = new CodePipelineStack(app, "devCodePipelineStack", {
    env: env,
    iamStack: {
      pipelineRoleArn: iamStack.roles.iamRoles[common.iam.roles.names.codepipeline].roleArn,
    },
  });
  codePipelineStack.node.addDependency(codeBuildStack);

  new EcsStack(app, "devEcsStack", {
    env: env,
    networkStack: {
      cfnSubnets: networkStack.Network.cfnSubnets,
      cfnSecurityGroups: networkStack.Network.cfnSecurityGroups,
    },
    iamStack: {
      executionRoleArn: iamStack.roles.iamRoles[common.iam.roles.names.ecsTaskeExecution].roleArn,
      taskRoleArn: iamStack.roles.iamRoles[common.iam.roles.names.ecsTaskeExecution].roleArn,
    },
    loadbalancerStack: {
      cfnTargetGroups: loadbalancerStack.loadbalancer.cfnTargetGroups,
    },
  });
} else if (process.env.NODE_ENV === "prd") {
  // 本番環境
}
