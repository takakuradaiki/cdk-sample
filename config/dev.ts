import { s3BucketConfig } from "./dev/s3BucketConfig";
import { s3BucketPolicyConfig } from "./dev/s3BucketPolicyConfig";
import { networkConfig } from "./dev/networkConfig";
import { albAcmConfig } from "./dev/acmConfig";
import { ecrConfig } from "./dev/ecrConfig";
import { albConfig } from "./dev/albConfig";
import { clusterConfig } from "./dev/ecsClusterConfig";
import { taskDefConfig } from "./dev/ecsTaskDefConfig";
import { logGroupConfig } from "./dev/logGroupConfig";
import { ecsIamConfig, userIamConfig } from "./dev/iamConfig";
import { ecsServiceConfig } from "./dev/ecsServiceConfig";
import { ssmParamsConfig } from "./dev/ssmParamsConfig";

import { route53Config } from "./dev/route53Config";
import { rdsConfig } from "./dev/rdsConfig";
import { codebuildConfig } from "./dev/codebuildConfig";
import { codepipelineConfig } from "./dev/codepipelineConfig";

export = {
  s3Bucket: {
    s3BucketConfig,
    s3BucketPolicyConfig,
  },
  network: {
    networkConfig,
  },
  acm: {
    albAcmConfig,
  },
  ecr: {
    ecrConfig,
  },
  alb: {
    albConfig,
  },
  logs: {
    logGroupConfig,
  },
  iam: {
    ecsIamConfig,
    userIamConfig,
  },
  route53: {
    route53Config,
  },
  rds: {
    rdsConfig,
  },

  codebuild: {
    codebuildConfig,
  },
  codepipeline: {
    codepipelineConfig,
  },
  ecs: {
    clusterConfig,
    taskDefConfig,
    ecsServiceConfig,
  },
  ssmParams: {
    ssmParamsConfig,
  },
};
