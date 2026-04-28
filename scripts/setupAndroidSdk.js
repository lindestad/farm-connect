const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const androidDir = path.join(rootDir, "android");
const localPropertiesPath = path.join(androidDir, "local.properties");

function normalizeSdkPath(sdkPath) {
  const normalized = path.resolve(sdkPath).replace(/\\/g, "/");
  return normalized.replace(/^([A-Za-z]):/, "$1\\:");
}

function candidatePaths() {
  const candidates = [
    process.argv[2],
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
  ];

  if (process.env.LOCALAPPDATA) {
    candidates.push(path.join(process.env.LOCALAPPDATA, "Android", "Sdk"));
  }

  const homeDir = os.homedir();
  candidates.push(
    path.join(homeDir, "Library", "Android", "sdk"),
    path.join(homeDir, "Android", "Sdk"),
  );

  return candidates.filter(Boolean);
}

function findSdkPath() {
  return candidatePaths().find((candidate) => fs.existsSync(candidate));
}

function upsertSdkDir(content, sdkPath) {
  const sdkDirLine = `sdk.dir=${normalizeSdkPath(sdkPath)}`;

  if (!content.trim()) {
    return `${sdkDirLine}\n`;
  }

  if (/^sdk\.dir=.*$/m.test(content)) {
    return content.replace(/^sdk\.dir=.*$/m, sdkDirLine);
  }

  const separator = content.endsWith("\n") ? "" : "\n";
  return `${content}${separator}${sdkDirLine}\n`;
}

const sdkPath = findSdkPath();

if (!sdkPath) {
  console.error("Android SDK not found.");
  console.error("Install Android Studio, then either:");
  console.error("- set ANDROID_HOME or ANDROID_SDK_ROOT, or");
  console.error("- run: npm run setup:android -- <path-to-android-sdk>");
  process.exit(1);
}

if (!fs.existsSync(androidDir)) {
  console.error(`Android directory not found: ${androidDir}`);
  process.exit(1);
}

const currentContent = fs.existsSync(localPropertiesPath)
  ? fs.readFileSync(localPropertiesPath, "utf8")
  : "";

fs.writeFileSync(localPropertiesPath, upsertSdkDir(currentContent, sdkPath));
console.log(`Updated android/local.properties with SDK path: ${sdkPath}`);
