// config / dev / ecsClusterConfig.ts;
import { common } from "../common/dev-common";

export const clusterConfig = {
  cfnClusters: [
    {
      clusterName: common.ecs.clusters.names.api,
      clusterSettings: [{ name: "containerInsights", value: "enabled" }],
      capacityProviders: ["FARGATE_SPOT"],
      defaultCapacityProviderStrategy: [{ capacityProvider: "FARGATE_SPOT", weight: 1 }],
      tags: [{ key: "Name", value: common.ecs.clusters.names.api }],
    },
    {
      clusterName: common.ecs.clusters.names.admin,
      clusterSettings: [{ name: "containerInsights", value: "enabled" }],
      capacityProviders: ["FARGATE_SPOT"],
      defaultCapacityProviderStrategy: [{ capacityProvider: "FARGATE_SPOT", weight: 1 }],
      tags: [{ key: "Name", value: common.ecs.clusters.names.admin }],
    },
    {
      clusterName: common.ecs.clusters.names.batch,
      clusterSettings: [{ name: "containerInsights", value: "enabled" }],
      capacityProviders: ["FARGATE_SPOT"],
      defaultCapacityProviderStrategy: [{ capacityProvider: "FARGATE_SPOT", weight: 1 }],
      tags: [{ key: "Name", value: common.ecs.clusters.names.batch }],
    },
    {
      clusterName: common.ecs.clusters.names.bastion,
      clusterSettings: [{ name: "containerInsights", value: "enabled" }],
      capacityProviders: ["FARGATE_SPOT"],
      tags: [{ key: "Name", value: common.ecs.clusters.names.bastion }],
    },
  ],
} as const;
