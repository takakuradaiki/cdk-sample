// config/dev/ecsTaskDefConfig.ts
import { Aws } from "aws-cdk-lib";
import { common } from "../common/dev-common";

export const taskDefConfig = {
  cfnTaskDefinitions: [
    // admin
    getTaskDefinition(common.ecs.tasks.names.admin, "512", "1024", [
      {
        image: `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${common.ecr.repositories.names.admin}:latest`,
        name: common.ecs.containers.names.admin,
        secrets: [
          {
            valueFrom: "NEXT_BACKEND_API_URL",
            name: "NEXT_BACKEND_API_URL",
          },
          {
            valueFrom: "ADMIN_FRONT_URL",
            name: "NEXTAUTH_URL",
          },
        ],
        portMappings: [
          {
            hostPort: 3000,
            protocol: "tcp",
            containerPort: 3000,
          },
        ],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": "admin-logs",
            "awslogs-region": Aws.REGION,
            "awslogs-stream-prefix": common.ecs.containers.names.admin,
          },
        },
      },
    ]),
    // batch_server
    getTaskDefinition(common.ecs.tasks.names.batch, "512", "1024", [
      {
        image: `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${common.ecr.repositories.names.batch}:latest`,
        name: common.ecs.containers.names.bath,
        secrets: [
          {
            valueFrom: "DB_DATABASE",
            name: "DB_DATABASE",
          },
          {
            valueFrom: "DB_HOST",
            name: "DB_HOST",
          },
          {
            valueFrom: "DB_WRITE_HOST",
            name: "DB_WRITE_HOST",
          },
          {
            valueFrom: "DB_READ_HOST",
            name: "DB_READ_HOST",
          },
          {
            valueFrom: "DB_PASSWORD",
            name: "DB_PASSWORD",
          },
          {
            valueFrom: "DB_PORT",
            name: "DB_PORT",
          },
          {
            valueFrom: "DB_USERNAME",
            name: "DB_USERNAME",
          },
          {
            valueFrom: "APP_KEY",
            name: "APP_KEY",
          },
          {
            valueFrom: "APP_ENV",
            name: "APP_ENV",
          },
          {
            valueFrom: "APP_DEBUG",
            name: "APP_DEBUG",
          },
          {
            valueFrom: "APP_URL",
            name: "APP_URL",
          },
          {
            valueFrom: "ADMIN_FRONT_URL",
            name: "ADMIN_FRONT_URL",
          },
          {
            valueFrom: "SES_ACCESS_KEY_ID",
            name: "SES_ACCESS_KEY_ID",
          },
          {
            valueFrom: "SES_SECRET_ACCESS_KEY",
            name: "SES_SECRET_ACCESS_KEY",
          },
          {
            valueFrom: "S3_PRIVATE_BUCKET",
            name: "S3_PRIVATE_BUCKET",
          },
        ],
        portMappings: [],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": "batch-logs",
            "awslogs-region": Aws.REGION,
            "awslogs-stream-prefix": common.ecs.containers.names.bath,
          },
        },
      },
    ]),
    // api
    getTaskDefinition(common.ecs.tasks.names.api, "512", "1024", [
      {
        // web
        image: `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${common.ecr.repositories.names.apiWeb}:latest`,
        name: common.ecs.containers.names.apiWeb,
        secrets: [],
        portMappings: [
          {
            hostPort: 80,
            protocol: "tcp",
            containerPort: 80,
          },
        ],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": "api-logs",
            "awslogs-region": Aws.REGION,
            "awslogs-stream-prefix": common.ecs.containers.names.apiWeb,
          },
        },
        dependsOn: [
          {
            containerName: common.ecs.containers.names.api,
            condition: "START",
          },
        ],
      },
      {
        // api
        image: `${Aws.ACCOUNT_ID}.dkr.ecr.${Aws.REGION}.amazonaws.com/${common.ecr.repositories.names.api}:latest`,
        name: common.ecs.containers.names.api,
        secrets: [
          {
            valueFrom: "DB_DATABASE",
            name: "DB_DATABASE",
          },
          {
            valueFrom: "DB_HOST",
            name: "DB_HOST",
          },
          {
            valueFrom: "DB_WRITE_HOST",
            name: "DB_WRITE_HOST",
          },
          {
            valueFrom: "DB_READ_HOST",
            name: "DB_READ_HOST",
          },
          {
            valueFrom: "DB_PASSWORD",
            name: "DB_PASSWORD",
          },
          {
            valueFrom: "DB_PORT",
            name: "DB_PORT",
          },
          {
            valueFrom: "DB_USERNAME",
            name: "DB_USERNAME",
          },
          {
            valueFrom: "APP_KEY",
            name: "APP_KEY",
          },
          {
            valueFrom: "APP_ENV",
            name: "APP_ENV",
          },
          {
            valueFrom: "APP_DEBUG",
            name: "APP_DEBUG",
          },
          {
            valueFrom: "APP_URL",
            name: "APP_URL",
          },
          {
            valueFrom: "ADMIN_FRONT_URL",
            name: "ADMIN_FRONT_URL",
          },
          {
            valueFrom: "SES_ACCESS_KEY_ID",
            name: "SES_ACCESS_KEY_ID",
          },
          {
            valueFrom: "SES_SECRET_ACCESS_KEY",
            name: "SES_SECRET_ACCESS_KEY",
          },
          {
            valueFrom: "S3_PRIVATE_BUCKET",
            name: "S3_PRIVATE_BUCKET",
          },
        ],
        portMappings: [],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": "api-logs",
            "awslogs-region": Aws.REGION,
            "awslogs-stream-prefix": common.ecs.containers.names.api,
          },
        },
      },
    ]),
    // bastion
    getTaskDefinition(common.ecs.tasks.names.bastion, "256", "512", [
      {
        image: `amazonlinux:2`,
        name: "bastion-container",
        secrets: [],
        portMappings: [],
        command: ["sh", "-c", "while true; do sleep 30; done"],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": "bastion-host-logs",
            "awslogs-region": Aws.REGION,
            "awslogs-stream-prefix": "bastion",
          },
        },
      },
    ]),
  ],
} as const;

function getTaskDefinition(
  family: string,
  cpu: string,
  memory: string,
  containerDefinitions: {
    image: string;
    name: string;
    secrets: { name: string; valueFrom: string }[];
    portMappings: { containerPort: number; hostPort: number; protocol: string }[];
    logConfiguration: {
      logDriver: string;
      options: { [key: string]: string };
    };
    command?: string[];
    dependsOn?: [
      {
        containerName: string;
        condition: string;
      }
    ];
  }[]
) {
  return {
    family: family,
    networkMode: "awsvpc",
    cpu: cpu,
    memory: memory,
    requiresCompatibilities: ["FARGATE"],
    runtimePlatform: {
      // ARM64
      cpuArchitecture: "ARM64",
      operatingSystemFamily: "LINUX",
    },
    enableFaultInjection: false,
    containerDefinitions: containerDefinitions.map((containerDefinition) => ({
      image: containerDefinition.image,
      name: containerDefinition.name,
      cpu: 0,
      memory: undefined,
      essential: true,
      startTimeout: undefined,
      stopTimeout: undefined,
      environment: [],
      environmentFiles: undefined,
      secrets: containerDefinition.secrets,
      portMappings: containerDefinition.portMappings,
      logConfiguration: containerDefinition.logConfiguration,
      user: "0",
      mountPoints: [],
      volumesFrom: [],
      firelensConfiguration: undefined,
      command: containerDefinition.command,
      credentialSpecs: undefined,
      dependsOn: containerDefinition.dependsOn,
      disableNetworking: undefined,
      dnsSearchDomains: undefined,
      dnsServers: undefined,
      dockerLabels: undefined,
      dockerSecurityOptions: undefined,
      entryPoint: undefined,
      healthCheck: undefined,
      hostname: undefined,
      extraHosts: undefined,
      interactive: undefined,
      links: undefined,
      linuxParameters: undefined,
      memoryReservation: undefined,
      privileged: undefined,
      pseudoTerminal: undefined,
      readonlyRootFilesystem: undefined,
      repositoryCredentials: undefined,
      resourceRequirements: undefined,
      restartPolicy: undefined,
      systemControls: undefined,
      ulimits: undefined,
      workingDirectory: undefined,
    })),
  };
}
