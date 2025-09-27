// config/dev/acm.ts
import { common } from "../common/dev-common";

export const albAcmConfig = {
  hostedZoneId: common.domains.hostedZoneId,
  domainName: common.domains.baseDomainName,
  DnsValidatedCertificates: [
    {
      domainName: common.domains.baseDomainName,
      subjectAlternativeNames: [`*.${common.domains.baseDomainName}`],
    },
  ],
} as const;
