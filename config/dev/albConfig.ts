// config/dev/albConfig.ts
import { common } from "../common/dev-common";

export const albConfig = {
  cfnLoadBalancer: {
    name: "takafish-alb",
    scheme: "internet-facing",
    type: "application",
    loadBalancerAttributes: [{ key: "routing.http2.enabled", value: "true" }],
    tags: [{ key: "Name", value: "takafish-alb" }],
  },

  // ★ 3つのターゲットグループ
  cfnTargetGroups: [
    {
      name: common.loadbalancer.targetGroups.names.api,
      port: 80,
      protocol: "HTTP",
      healthCheckPath: "/api/healthcheck",
      healthyThresholdCount: 3,
      unhealthyThresholdCount: 3,
      healthCheckTimeoutSeconds: 5,
      matcher: "200",
      tags: [{ key: "Name", value: common.loadbalancer.targetGroups.names.api }],
    },
    {
      name: common.loadbalancer.targetGroups.names.admin,
      port: 3000,
      protocol: "HTTP",
      healthCheckPath: "/login",
      healthyThresholdCount: 3,
      unhealthyThresholdCount: 3,
      healthCheckTimeoutSeconds: 5,
      matcher: "200",
      tags: [{ key: "Name", value: common.loadbalancer.targetGroups.names.admin }],
    },
  ],

  // 80 → 443 リダイレクト ＋ 443 は 2016-08 ポリシー（スクショ準拠）
  cfnListeners: [
    {
      id: "http-80",
      port: 80,
      protocol: "HTTP",
      defaultAction: { type: "redirect", redirectPort: "443", redirectProtocol: "HTTPS", statusCode: "HTTP_301" },
    },
    {
      id: "https-443",
      port: 443,
      protocol: "HTTPS",
      sslPolicy: "ELBSecurityPolicy-2016-08",
      defaultAction: { type: "forward", targetGroupRef: common.loadbalancer.targetGroups.names.api }, // ← デフォルトは api
    },
  ],

  // ★ HostHeader ルール + 管理画面のIP許可
  cfnListenerRules: [
    {
      id: "host-api",
      listenerRef: "https-443",
      priority: 200,
      conditions: { hostHeaders: [`api.${common.domains.baseDomainName}`] },
      action: { type: "forward", targetGroupRef: common.loadbalancer.targetGroups.names.api },
    },
    {
      id: "host-admin-allow",
      listenerRef: "https-443",
      priority: 300,
      conditions: {
        hostHeaders: [`admin.${common.domains.baseDomainName}`],
        // 管理画面のIP許可
        sourceIps: [],
      },
      action: { type: "forward", targetGroupRef: common.loadbalancer.targetGroups.names.admin },
    },
  ],
} as const;
