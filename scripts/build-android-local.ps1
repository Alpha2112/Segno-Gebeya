param([string]$Architecture='x86_64')
$ErrorActionPreference='Stop'
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$shortBuild=Join-Path ([IO.Path]::GetPathRoot($repoRoot)) ('sgb-'+[Guid]::NewGuid().ToString('N').Substring(0,6))
if(Test-Path -LiteralPath $shortBuild){throw 'Build target already exists'}
New-Item -ItemType Directory -Path $shortBuild | Out-Null
Set-Content -LiteralPath (Join-Path $shortBuild '.segno-owned-build') -Value $repoRoot
# Copy mobile/workspace sources only; backend private storage never enters a native build.
foreach($sourceArea in @('apps','packages')){
 & robocopy (Join-Path $repoRoot $sourceArea) (Join-Path $shortBuild $sourceArea) /E /XD node_modules android ios dist dist-android .expo .git .tools /XF '*.log' '.env' '.env.*' '*.jks' '*.p12' 'credentials.json' /NFL /NDL /NJH /NJS | Out-Null
 if($LASTEXITCODE -ge 8){throw "Source copy failed: $LASTEXITCODE"}
}
foreach($sourceFile in @('package.json','pnpm-lock.yaml','pnpm-workspace.yaml','.npmrc','.gitignore','tsconfig.base.json')){Copy-Item -LiteralPath (Join-Path $repoRoot $sourceFile) -Destination (Join-Path $shortBuild $sourceFile)}
$env:PATH=(Join-Path $repoRoot '.tools/node')+';'+$env:PATH
$env:SEGNO_DEV_HTTP='true'
$env:CI='1'
if(!$env:ANDROID_HOME){$env:ANDROID_HOME=Join-Path $env:LOCALAPPDATA 'Android/Sdk'}
if(!$env:JAVA_HOME){$env:JAVA_HOME='C:\Program Files\Java\jdk-17'}
@{source=$repoRoot;build=$shortBuild;architecture=$Architecture;created=(Get-Date).ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $repoRoot '.tools/android-build-location.json')
Push-Location $shortBuild
try {
 & pnpm install --frozen-lockfile
 if($LASTEXITCODE){throw 'Dependency installation failed'}
 Push-Location apps/mobile
 try {
  & pnpm exec expo prebuild --platform android --no-install
  if($LASTEXITCODE){throw 'Expo prebuild failed'}
  Push-Location android
  try {
   & .\gradlew.bat :app:assembleDebug "-PreactNativeArchitectures=$Architecture" --max-workers=1 --no-daemon '-Pkotlin.compiler.execution.strategy=in-process' '-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m' --console=plain
   if($LASTEXITCODE){throw 'Android compilation failed'}
  }finally{Pop-Location}
 }finally{Pop-Location}
 $artifactDir=Join-Path $repoRoot '.tools/artifacts'
 New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
 $artifact=Join-Path $artifactDir 'segno-gebeya-m1-debug.apk'
 Copy-Item -LiteralPath (Join-Path $shortBuild 'apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk') -Destination $artifact
 @{artifact=$artifact;sha256=(Get-FileHash -LiteralPath $artifact -Algorithm SHA256).Hash;build=$shortBuild;architecture=$Architecture} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $artifactDir 'android-artifact.json')
 Write-Output "Android development APK: $artifact"
}finally{Pop-Location}
