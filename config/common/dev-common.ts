import { Aws } from "aws-cdk-lib";

// customize
const systemName = "foobar-takafish";
const envName = "dev";
const commonName = `${systemName}-${envName}`;

export const common = {
  commonName: commonName,
  network: {
    azs: {
      a: `${Aws.REGION}a`,
      c: `${Aws.REGION}c`,
    },
    subnets: {
      names: {
        publicA: "public-subnet-a",
        publicC: "public-subnet-c",
        appA: "app-subnet-a",
        appC: "app-subnet-c",
        batchA: "batch-subnet-a",
        batchC: "batch-subnet-c",
        dbA: "db-subnet-a",
        dbC: "db-subnet-c",
      },
    },
    securityGroups: {
      names: {
        egress: "egress-aws-sg",
        app: "app-sg",
        alb: "alb-sg",
        batch: "batch-sg",
        migration: "app-db-migration-sg",
        bastion: "bastion-sg",
        db: "db-sg",
      },
    },
  },
  iam: {
    roles: {
      names: {
        codebuild: "codebuild-role-cdk",
        codepipeline: "codepipeline-role-cdk",
        ecsTaskeExecution: "ecs-task-execution-role-cdk",
        ecsTask: "ecs-task-app-role-cdk",
        ecsSchedulingTask: "ecs-task-batch-role-cdk",
        bastion: "bastion-role-cdk",
        lambdaCommon: "lambda-role-cdk",
        schedulerRds: "eventbridge-scheduler-rds-start-stop-role-cdk",
      },
    },
  },
  domains: {
    // customize
    baseDomainName: "takafish.link",
    // customize
    hostedZoneId: "Z0132452355QEQAY3Q68G",
  },
  loadbalancer: {
    targetGroups: {
      names: {
        admin: "admin-tg",
        api: "api-tg",
      },
    },
  },
  s3: {
    buckets: {
      names: {
        sample: "dev-sample-bucket-test",
        backend: `${commonName}-backend`,
        albLogs: `${commonName}-alb-logs`,
        sessionManagerLog: `${commonName}-dev-session-manager-log`,
        // customize
        codepipeline: `${commonName}-codepipeline`,
      },
    },
  },
  codeBuild: {
    buildProjects: {
      names: {
        adminBuild: "admin-build",
        apiBuild: "api-build",
        batchBuild: "batch-build",
        migBuild: "api-migration",
      },
    },
  },
  ecr: {
    repositories: {
      names: {
        admin: "admin-app",
        api: "api-app",
        batch: "api-batch",
        phpcli: "api-php-cli",
        apiWeb: "api-web",
      },
    },
  },
  ecs: {
    clusters: {
      names: {
        admin: "admin-cluster",
        api: "api-cluster",
        batch: "batch-cluster",
        bastion: "bastion-cluster",
      },
    },
    services: {
      names: {
        admin: "admin",
        api: "api",
        batch: "batch",
        bastion: "bastion-service",
      },
    },
    tasks: {
      names: {
        admin: "admin",
        api: "api",
        batch: "batch",
        bastion: "bastion-host",
      },
    },
    containers: {
      names: {
        admin: "admin-app",
        api: "api-app",
        apiWeb: "api-web",
        bath: "batch-app",
      },
    },
  },
};
