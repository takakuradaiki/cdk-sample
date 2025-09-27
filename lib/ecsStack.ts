import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import config = require("config");
import { EcsClusterProps, EcsClusters } from "./resoures/ecsCluster";
import { EcsTaskDefs, EcsTaskDefsProps } from "./resoures/ecsTaskDefs";
import { EcsServices, EcsServicesProps } from "./resoures/ecsService";
import { CfnSubnet, CfnSecurityGroup } from "aws-cdk-lib/aws-ec2";
import { CfnTargetGroup } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface EcsStackProps extends StackProps {
  networkStack: {
    cfnSubnets: Record<string, CfnSubnet>;
    cfnSecurityGroups: Record<string, CfnSecurityGroup>;
  };
  iamStack: {
    executionRoleArn: string;
    taskRoleArn: string;
  };
  loadbalancerStack: {
    cfnTargetGroups: Record<string, CfnTargetGroup>;
  };
}

export class EcsStack extends Stack {
  public readonly ecsClusters: EcsClusters;
  public readonly ecsTaskDefs: EcsTaskDefs;
  public readonly ecsServices: EcsServices;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    this.ecsClusters = new EcsClusters(this, "EcsClusters", config.get<EcsClusterProps>("ecs.clusterConfig"));

    this.ecsTaskDefs = new EcsTaskDefs(this, "EcsTaskDefs", {
      ...config.get<EcsTaskDefsProps>("ecs.taskDefConfig"),
      iamStack: {
        executionRoleArn: props.iamStack.executionRoleArn,
        taskRoleArn: props.iamStack.taskRoleArn,
      },
    });

    // --- ECS サービス群を構築 ---
    this.ecsServices = new EcsServices(this, "EcsServices", {
      ...config.get<EcsServicesProps>("ecs.ecsServiceConfig"),
      cfnClusters: this.ecsClusters.cfnClusters,
      cfnTaskDefinitions: this.ecsTaskDefs.cfnTaskDefinitions,
      networkStack: {
        cfnSubnets: props.networkStack.cfnSubnets,
        cfnSecurityGroups: props.networkStack.cfnSecurityGroups,
      },
      loadbalancerStack: {
        cfnTargetGroups: props.loadbalancerStack.cfnTargetGroups,
      },
    });
    this.ecsServices.node.addDependency(this.ecsClusters);
    this.ecsServices.node.addDependency(this.ecsTaskDefs);
  }
}
