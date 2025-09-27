// config/dev/route53Config.ts
import { common } from "../common/dev-common";

export const route53Config = {
  cfnRecordSets: [
    {
      type: "A",
      name: "admin",
      target: { kind: "alb", targetKey: "app-alb" },
      route53hostedZone: {
        zoneName: common.domains.baseDomainName,
        hostedZoneId: common.domains.hostedZoneId,
      },
    },
    {
      type: "A",
      name: "api",
      target: { kind: "alb", targetKey: "app-alb" },
      route53hostedZone: {
        zoneName: common.domains.baseDomainName,
        hostedZoneId: common.domains.hostedZoneId,
      },
    },
    {
      type: "A",
      name: "user",
      target: { kind: "alb", targetKey: "app-alb" },
      route53hostedZone: {
        zoneName: common.domains.baseDomainName,
        hostedZoneId: common.domains.hostedZoneId,
      },
    },
  ],
} as const;
