// lib/resoures/EcsServices.ts  ← パスはプロジェクト構成に合わせてください
import { Construct } from "constructs";
import { CfnService, CfnTaskDefinition } from "aws-cdk-lib/aws-ecs";
import { CfnCluster } from "aws-cdk-lib/aws-ecs";
import { CfnSubnet, CfnSecurityGroup } from "aws-cdk-lib/aws-ec2";
import { CfnTargetGroup } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface EcsServicesProps {
  cfnClusters: Record<string, CfnCluster>;
  cfnTaskDefinitions: Record<string, CfnTaskDefinition>;
  networkStack: {
    cfnSubnets: Record<string, CfnSubnet>;
    cfnSecurityGroups: Record<string, CfnSecurityGroup>;
  };
  loadbalancerStack: {
    cfnTargetGroups: Record<string, CfnTargetGroup>;
  };
  cfnServices: [
    {
      serviceName: string;
      clusterKey: string;
      taskDefinitionKey: string;
      desiredCount: number;
      launchType: string;
      platformVersion: string;
      enableExecuteCommand: boolean;
      enableEcsManagedTags: boolean;
      healthCheckGracePeriodSeconds: number;
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: string[];
          securityGroupIds: string[];
          assignPublicIp: string;
        };
      };
      deploymentController: { type: string };
      deploymentConfiguration: {
        deploymentCircuitBreaker: {
          enable: boolean;
          rollback: boolean;
        };
      };
      loadBalancers?: [
        {
          targetGroupKey: string;
          containerName: string;
          containerPort: number;
        }
      ];
      tags: [{ key: string; value: string }];
    }
  ];
}

export class EcsServices extends Construct {
  private cfnService: Record<string, CfnService> = {};
  constructor(scope: Construct, id: string, props: EcsServicesProps) {
    super(scope, id);

    props.cfnServices.forEach((cfnService) => {
      this.cfnService[cfnService.serviceName] = new CfnService(this, cfnService.serviceName, {
        serviceName: cfnService.serviceName,
        cluster: props.cfnClusters[cfnService.clusterKey].ref,
        taskDefinition: props.cfnTaskDefinitions[cfnService.taskDefinitionKey].ref,
        desiredCount: cfnService.desiredCount,
        launchType: cfnService.launchType,
        enableExecuteCommand: cfnService.enableExecuteCommand,
        enableEcsManagedTags: cfnService.enableEcsManagedTags,
        healthCheckGracePeriodSeconds: cfnService.healthCheckGracePeriodSeconds,
        networkConfiguration: {
          awsvpcConfiguration: {
            subnets: cfnService.networkConfiguration.awsvpcConfiguration.subnets.map(
              (subnet) => props.networkStack.cfnSubnets[subnet].ref
            ),
            securityGroups: cfnService.networkConfiguration.awsvpcConfiguration.securityGroupIds.map(
              (sg) => props.networkStack.cfnSecurityGroups[sg].ref
            ),
            assignPublicIp: cfnService.networkConfiguration.awsvpcConfiguration.assignPublicIp,
          },
        },
        deploymentController: cfnService.deploymentController,
        deploymentConfiguration: cfnService.deploymentConfiguration,
        loadBalancers: cfnService.loadBalancers?.map((loadBalancer) => {
          return {
            targetGroupArn: props.loadbalancerStack.cfnTargetGroups[loadBalancer.targetGroupKey].ref,
            containerName: loadBalancer.containerName,
            containerPort: loadBalancer.containerPort,
          };
        }),
        tags: cfnService.tags,
      });
    });
  }
}
