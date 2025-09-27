// config/dev/codepipelineConfig.ts
import { Aws } from "aws-cdk-lib";
import { common } from "../common/dev-common";

const artifactStore = {
  type: "S3",
  location: common.s3.buckets.names.codepipeline,
  encryptionKey: {
    id: `arn:aws:kms:${Aws.REGION}:${Aws.ACCOUNT_ID}:alias/aws/s3`,
    type: "KMS",
  },
};

export const codepipelineConfig = {
  artifactStore: artifactStore,
  cfnPipelines: [
    {
      // admin
      name: `${common.commonName}-admin-pipeline`,
      stages: [
        // customize
        getSourceActions("takakuradaiki/foobar-admin-frontend"),
        getBuildActions(common.codeBuild.buildProjects.names.adminBuild),
        getDeployEcsActions({
          ClusterName: common.ecs.clusters.names.admin,
          ServiceName: common.ecs.services.names.admin,
          FileName: "imagedefinitions-admin.json",
          DeploymentTimeout: "20",
        }),
      ],
    },
    {
      // api
      name: `${common.commonName}-api-pipeline`,
      stages: [
        // customize
        getSourceActions("takakuradaiki/foobar-api-backend"),
        getBuildActions(common.codeBuild.buildProjects.names.apiBuild),
        {
          name: "Migration",
          actions: [
            {
              name: "Migration",
              actionTypeId: {
                category: "Build",
                owner: "AWS",
                provider: "CodeBuild",
                version: "1",
              },
              inputArtifacts: [{ name: "source_artifact" }],
              configuration: {
                ProjectName: common.codeBuild.buildProjects.names.migBuild,
              },
              runOrder: 1,
            },
          ],
        },
        getDeployEcsActions({
          ClusterName: common.ecs.clusters.names.api,
          ServiceName: common.ecs.services.names.api,
          FileName: "imagedefinitions-api.json",
          DeploymentTimeout: "10",
        }),
      ],
    },
    {
      // batch
      name: `${common.commonName}-batch-pipeline`,
      stages: [
        // customize
        getSourceActions("takakuradaiki/foobar-api-backend"),
        getBuildActions(common.codeBuild.buildProjects.names.batchBuild),
        {
          name: "Migration",
          actions: [
            {
              name: "Migration",
              actionTypeId: {
                category: "Build",
                owner: "AWS",
                provider: "CodeBuild",
                version: "1",
              },
              inputArtifacts: [{ name: "source_artifact" }],
              configuration: {
                ProjectName: common.codeBuild.buildProjects.names.migBuild,
              },
              runOrder: 1,
            },
          ],
        },
        getDeployEcsActions({
          ClusterName: common.ecs.clusters.names.batch,
          ServiceName: common.ecs.services.names.batch,
          FileName: "imagedefinitions-batch.json",
          DeploymentTimeout: "10",
        }),
      ],
    },
  ],
} as const;

function getSourceActions(fullRepositoryId: string) {
  // customize
  const connectionArn = `arn:aws:codeconnections:us-east-2:${Aws.ACCOUNT_ID}:connection/c1542ec3-4938-4c80-a88f-8773aac2528f`;
  return {
    name: "Source",
    actions: [
      {
        name: "Source",
        actionTypeId: {
          category: "Source",
          owner: "AWS",
          provider: "CodeStarSourceConnection",
          version: "1",
        },
        outputArtifacts: [{ name: "source_artifact" }],
        configuration: {
          ConnectionArn: connectionArn,
          FullRepositoryId: fullRepositoryId,
          BranchName: "develop",
          OutputArtifactFormat: "CODE_ZIP",
          DetectChanges: "true",
        },
        runOrder: 1,
      },
    ],
  };
}

function getBuildActions(ProjectName: string) {
  return {
    name: "Build",
    actions: [
      {
        name: "Build",
        actionTypeId: {
          category: "Build",
          owner: "AWS",
          provider: "CodeBuild",
          version: "1",
        },
        inputArtifacts: [{ name: "source_artifact" }],
        outputArtifacts: [{ name: "build_artifact" }],
        configuration: {
          ProjectName: ProjectName,
        },
        runOrder: 1,
      },
    ],
  };
}

function getDeployEcsActions(configuration: {
  ClusterName: string;
  ServiceName: string;
  FileName: string;
  DeploymentTimeout: string;
}) {
  return {
    name: "Deploy",
    actions: [
      {
        name: "DeployToECS",
        actionTypeId: {
          category: "Deploy",
          owner: "AWS",
          provider: "ECS",
          version: "1",
        },
        inputArtifacts: [{ name: "build_artifact" }],
        configuration: configuration,
        runOrder: 1,
      },
    ],
  };
}
