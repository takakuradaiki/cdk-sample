// config/dev/codebuildConfig.ts
import { common } from "../common/dev-common";

export const codebuildConfig = {
  cfnCodeBuildProjects: [
    {
      // admin-server-build
      name: common.codeBuild.buildProjects.names.adminBuild,
      description: "Admin Batch Image",
      artifacts: { type: "CODEPIPELINE" },
      timeoutInMinutes: 60,
      queuedTimeoutInMinutes: 60,
      cache: { type: "LOCAL", modes: ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"] },
      environment: {
        computeType: "BUILD_GENERAL1_SMALL",
        image: "aws/codebuild/amazonlinux2-aarch64-standard:3.0",
        type: "ARM_CONTAINER",
        privilegedMode: true,
        imagePullCredentialsType: "CODEBUILD",
        environmentVariables: [
          { name: "IMAGE_NAME_NODE", value: common.ecr.repositories.names.admin },
          { name: "TASK_CONTAINER_NAME_NODE", value: common.ecs.containers.names.admin },
        ],
      },
      cloudWatchLogs: { groupName: "codebuild-logs", streamName: "admin-server-app", status: "ENABLED" },
      source: { type: "CODEPIPELINE", buildSpec: "buildspec.yml" },
    },
    {
      // api-server-build
      name: common.codeBuild.buildProjects.names.apiBuild,
      description: "Build API Image",
      artifacts: { type: "CODEPIPELINE" },
      timeoutInMinutes: 60,
      queuedTimeoutInMinutes: 60,
      cache: { type: "LOCAL", modes: ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"] },
      environment: {
        computeType: "BUILD_GENERAL1_SMALL",
        image: "aws/codebuild/amazonlinux2-aarch64-standard:3.0",
        type: "ARM_CONTAINER",
        privilegedMode: true,
        imagePullCredentialsType: "CODEBUILD",
        environmentVariables: [
          { name: "IMAGE_NAME_WEB", value: common.ecr.repositories.names.apiWeb },
          { name: "IMAGE_NAME_APP", value: common.ecr.repositories.names.api },
          { name: "IMAGE_NAME_PHP_CLI", value: common.ecr.repositories.names.phpcli },
          { name: "TASK_CONTAINER_NAME_WEB", value: common.ecs.containers.names.apiWeb },
          { name: "TASK_CONTAINER_NAME_APP", value: common.ecs.containers.names.api },
        ],
      },
      cloudWatchLogs: { groupName: "codebuild-logs", streamName: "api-server-image-building", status: "ENABLED" },
      source: { type: "CODEPIPELINE", buildSpec: "buildspec.yml" },
    },
    {
      // api-server-migration（VPC内で実行）
      name: common.codeBuild.buildProjects.names.migBuild,
      description: "Migrate API DB",
      artifacts: { type: "CODEPIPELINE" },
      timeoutInMinutes: 60,
      queuedTimeoutInMinutes: 60,
      cache: { type: "LOCAL", modes: ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"] },
      environment: {
        computeType: "BUILD_GENERAL1_SMALL",
        image: "aws/codebuild/amazonlinux2-aarch64-standard:3.0",
        type: "ARM_CONTAINER",
        imagePullCredentialsType: "CODEBUILD",
        privilegedMode: true,
        environmentVariables: [{ name: "IMAGE_NAME_PHP_CLI", value: common.ecr.repositories.names.phpcli }],
      },
      cloudWatchLogs: { groupName: "codebuild-logs", streamName: "api-server-migration", status: "ENABLED" },
      source: { type: "CODEPIPELINE", buildSpec: "buildspec-migration.yml" },
      vpcConfig: {
        subnets: [common.network.subnets.names.appA, common.network.subnets.names.appC],
        securityGroupIds: [
          common.network.securityGroups.names.migration,
          common.network.securityGroups.names.egress,
        ],
      },
    },
    {
      // batch-server-build
      name: common.codeBuild.buildProjects.names.batchBuild,
      description: "Build Batch Image",
      artifacts: { type: "CODEPIPELINE" },
      timeoutInMinutes: 60,
      queuedTimeoutInMinutes: 60,
      cache: { type: "LOCAL", modes: ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"] },
      environment: {
        computeType: "BUILD_GENERAL1_SMALL",
        image: "aws/codebuild/amazonlinux2-aarch64-standard:3.0",
        type: "ARM_CONTAINER",
        privilegedMode: true,
        imagePullCredentialsType: "CODEBUILD",
        environmentVariables: [
          { name: "IMAGE_NAME_BATCH", value: common.ecr.repositories.names.batch },
          { name: "TASK_CONTAINER_NAME_BATCH", value: common.ecs.containers.names.bath },
        ],
      },
      cloudWatchLogs: { groupName: "codebuild-logs", streamName: "api-server-batch-server", status: "ENABLED" },
      source: { type: "CODEPIPELINE", buildSpec: "buildspec.yml" },
    },
  ],
} as const;
