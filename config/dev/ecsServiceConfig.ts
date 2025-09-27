// config/dev/ecsServiceConfig.ts
import { common } from "../common/dev-common";

export const ecsServiceConfig = {
  cfnServices: [
    {
      // admin
      serviceName: common.ecs.services.names.admin,
      clusterKey: common.ecs.clusters.names.admin,
      taskDefinitionKey: common.ecs.tasks.names.admin,
      desiredCount: 0,
      launchType: "FARGATE",
      platformVersion: "1.4.0",
      enableExecuteCommand: true,
      enableEcsManagedTags: true,
      healthCheckGracePeriodSeconds: 120,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [common.network.subnets.names.appA, common.network.subnets.names.appC],
          securityGroupIds: [common.network.securityGroups.names.app, common.network.securityGroups.names.egress],
          assignPublicIp: "DISABLED",
        },
      },
      deploymentController: { type: "ECS" },
      deploymentConfiguration: {
        deploymentCircuitBreaker: {
          enable: true,
          rollback: true,
        },
      },
      loadBalancers: [
        {
          targetGroupKey: common.loadbalancer.targetGroups.names.admin,
          containerName: common.ecs.containers.names.admin,
          containerPort: 3000,
        },
      ],
      tags: [{ key: "Name", value: common.ecs.services.names.admin }],
    },
    {
      // api
      serviceName: common.ecs.services.names.api,
      clusterKey: common.ecs.clusters.names.api,
      taskDefinitionKey: common.ecs.tasks.names.api,
      desiredCount: 0,
      launchType: "FARGATE",
      platformVersion: "1.4.0",
      enableExecuteCommand: true,
      enableEcsManagedTags: true,
      healthCheckGracePeriodSeconds: 120,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [common.network.subnets.names.appA, common.network.subnets.names.appC],
          securityGroupIds: [common.network.securityGroups.names.app, common.network.securityGroups.names.egress],
          assignPublicIp: "DISABLED",
        },
      },
      deploymentController: { type: "ECS" },
      deploymentConfiguration: {
        deploymentCircuitBreaker: {
          enable: true,
          rollback: true,
        },
      },
      loadBalancers: [
        {
          targetGroupKey: common.loadbalancer.targetGroups.names.api,
          containerName: common.ecs.containers.names.apiWeb,
          containerPort: 80,
        },
      ],

      tags: [{ key: "Name", value: common.ecs.services.names.api }],
    },
    {
      //batch
      serviceName: common.ecs.services.names.batch,
      clusterKey: common.ecs.clusters.names.batch,
      taskDefinitionKey: common.ecs.tasks.names.batch,
      desiredCount: 0,
      launchType: "FARGATE",
      platformVersion: "1.4.0",
      enableExecuteCommand: true,
      enableEcsManagedTags: true,
      healthCheckGracePeriodSeconds: 120,
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: [common.network.subnets.names.batchA, common.network.subnets.names.batchC],
          securityGroupIds: [
            common.network.securityGroups.names.batch,
            common.network.securityGroups.names.egress,
          ],
          assignPublicIp: "DISABLED",
        },
      },
      deploymentController: { type: "ECS" },
      deploymentConfiguration: {
        deploymentCircuitBreaker: {
          enable: true,
          rollback: true,
        },
      },

      tags: [{ key: "Name", value: common.ecs.services.names.batch }],
    },
    // // ================= LBなし（bastion） =================
    // {
    //   id: "bastion-service",
    //   serviceName: "bastion-service",

    //   clusterKey: common.ecs.clusters.names.bastion,
    //   taskDefinitionKey: "bastionTask",

    //   launchType: "FARGATE",
    //   desiredCount: 0,
    //   platformVersion: "1.4.0",

    //   networkConfiguration:{
    //     subnets: [common.network.subnets.names.appA, common.network.subnets.names.appC],
    //     securityGroupIds: [common.network.securityGroups.names.bastion],
    //      assignPublicIp: "DISABLED",
    //   },

    //   tags: [{ key: "Name", value: "bastion-service" }],
    // },
  ],
} as const;
