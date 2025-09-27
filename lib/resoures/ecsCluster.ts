import { Construct } from "constructs";
import { CfnCluster } from "aws-cdk-lib/aws-ecs";

export type CapacityProvider = "FARGATE" | "FARGATE_SPOT";

export interface CapacityProviderStrategyItem {
  capacityProvider: CapacityProvider;
  weight?: number;
  base?: number;
}

export interface ClusterItem {
  clusterName: string;
  clusterSettings: { name: string; value: string }[];
  capacityProviders: CapacityProvider[];
  defaultCapacityProviderStrategy: CapacityProviderStrategyItem[];
  tags: { key: string; value: string }[];
}

export interface EcsClusterProps {
  cfnClusters: ClusterItem[];
}

export class EcsClusters extends Construct {
  public readonly cfnClusters: Record<string, CfnCluster> = {};

  constructor(scope: Construct, id: string, props: EcsClusterProps) {
    super(scope, id);

    props.cfnClusters.forEach((cfnCluster) => {
      this.cfnClusters[cfnCluster.clusterName] = new CfnCluster(this, cfnCluster.clusterName, {
        clusterName: cfnCluster.clusterName,
        capacityProviders: cfnCluster.capacityProviders,
        defaultCapacityProviderStrategy: cfnCluster.defaultCapacityProviderStrategy,
        clusterSettings: cfnCluster.clusterSettings,
        tags: cfnCluster.tags,
      });
    });
  }
}
