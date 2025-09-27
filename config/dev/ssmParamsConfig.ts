// config/dev/ssmParamsConfig.ts
export const ssmParamsConfig = {
  Parameters: [
    // customize
    { name: "DOCKERHUB_USERNAME", type: "String", value: "takafish" },

    { name: "DB_ADMIN_PASSWORD", type: "SecureString", value: "change-me" },

    { name: "DB_DATABASE", type: "String", value: "foobar_database" },

    { name: "DB_WRITE_HOST", type: "String", value: "db-writer.example.rds.amazonaws.com" },
    { name: "DB_HOST", type: "String", value: "db-writer.example.rds.amazonaws.com" },
    { name: "DB_READ_HOST", type: "String", value: "db-reader.example.rds.amazonaws.com" },
    { name: "DB_PORT", type: "String", value: "3306" },

    { name: "DB_USERNAME", type: "String", value: "admin" },

    { name: "APP_ENV", type: "String", value: "development" },
    { name: "APP_ENV_SHORT", type: "String", value: "dev" },
    { name: "APP_DEBUG", type: "String", value: "true" },

    { name: "S3_PRIVATE_BUCKET", type: "String", value: "your-backend-bucket" },

    { name: "APP_URL", type: "String", value: "https://api.dev.example.com" },
    { name: "ADMIN_FRONT_URL", type: "String", value: "https://admin.dev.example.com" },

    { name: "NEXT_BACKEND_API_URL", type: "String", value: "https://api.dev.example.com/api/v1" },

    { name: "SES_ACCESS_KEY_ID", type: "String", value: "AKIA..." },
    { name: "SES_SECRET_ACCESS_KEY", type: "SecureString", value: "change-me" },

    // 下記もAWSコンソールから手動で更新すること
    { name: "NEXTAUTH_SECRET_FOR_PHARMACY", type: "SecureString", value: "your_secret_value" },

    // ===== Terraform の data source 相当（コメントで残す）=====
    // customize
    { name: "DOCKERHUB_PASSWORD", type: "SecureString", value: "test123" },
    // customize
    { name: "APP_KEY", type: "SecureString", value: "base64:0j2QfJOpuvg2hF+ERaZEmODK3+0DjAnT/V6RUwHEDeE=" },
    // customize
    { name: "DB_PASSWORD", type: "SecureString", value: "zx1oHBvWCabR4tOJy8Zk2YwsVOPz26w9" },
  ],
} as const;
