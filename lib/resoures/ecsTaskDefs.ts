import { CfnTaskDefinition } from "aws-cdk-lib/aws-ecs";
import { Construct } from "constructs";

export interface EcsTaskDefsProps {
  iamStack: {
    executionRoleArn: string;
    taskRoleArn: string;
  };
  cfnTaskDefinitions: CfnTaskDefinition[];
}

export class EcsTaskDefs extends Construct {
  public readonly cfnTaskDefinitions: Record<string, CfnTaskDefinition> = {};

  constructor(scope: Construct, id: string, props: EcsTaskDefsProps) {
    super(scope, id);

    props.cfnTaskDefinitions.forEach((taskDefinition) => {
      this.cfnTaskDefinitions[taskDefinition.family!] = new CfnTaskDefinition(this, taskDefinition.family!, {
        family: taskDefinition.family,
        cpu: taskDefinition.cpu,
        memory: taskDefinition.memory,
        networkMode: taskDefinition.networkMode,
        requiresCompatibilities: taskDefinition.requiresCompatibilities,
        runtimePlatform: taskDefinition.runtimePlatform,
        executionRoleArn: props.iamStack.executionRoleArn,
        taskRoleArn: props.iamStack.taskRoleArn,
        containerDefinitions: taskDefinition.containerDefinitions,
      });
    });
  }
}
