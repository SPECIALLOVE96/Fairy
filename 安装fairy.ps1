# fairy · 一键安装（PowerShell 版）
# 用法：双击同目录的「安装fairy.lnk」，或右键此文件 -> 使用 PowerShell 运行
# 说明：Windows 智能应用控制(SAC) 会拦 .cmd/.bat，但不拦已签名的 powershell.exe，
#      所以这里用 .ps1 + .lnk 绕过。

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ''
Write-Host '  ============================================' -ForegroundColor Cyan
Write-Host '    fairy 桌宠 · 一键安装' -ForegroundColor Cyan
Write-Host '  ============================================' -ForegroundColor Cyan
Write-Host ''

# 1. 找 dsh
$candidates = @(
  (Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd'),
  (Join-Path ${env:ProgramFiles} 'DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd')
)
$dsh = $null
foreach ($c in $candidates) { if (Test-Path $c) { $dsh = $c; break } }
if ($null -eq $dsh) {
  $cmd = Get-Command dsh -ErrorAction SilentlyContinue
  if ($cmd) { $dsh = $cmd.Source }
}
if ($null -eq $dsh) {
  Write-Host '  [x] 没找到 DeepSeek Harness，请确认已安装桌面版。' -ForegroundColor Red
  Read-Host '  按回车退出' | Out-Null
  exit 1
}

# 2. 决定装什么：优先本目录的 tgz，否则走 npm
$tgz = Get-ChildItem -Path $here -Filter 'dsh-pet-dafeiyu-*.tgz' -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($null -ne $tgz) {
  $spec = 'file:' + $tgz.FullName
  Write-Host "  安装包：$($tgz.Name)" -ForegroundColor Gray
} else {
  $spec = 'dsh-pet-dafeiyu'
  Write-Host '  安装包：npm 上的最新正式版' -ForegroundColor Gray
}

Write-Host "  dsh   ：$dsh" -ForegroundColor Gray
Write-Host ''
Write-Host '  建议先完全退出 DeepSeek Harness（关窗口不算退出）。' -ForegroundColor Yellow
Read-Host '  按回车开始安装' | Out-Null
Write-Host ''

# 3. 跑
try {
  & $dsh plugin --profile desktop add $spec
} catch {
  Write-Host ''
  Write-Host "  [x] 安装失败：$($_.Exception.Message)" -ForegroundColor Red
  Read-Host '  按回车退出' | Out-Null
  exit 1
}

Write-Host ''
Write-Host '  ============================================' -ForegroundColor Green
Write-Host '    装好了！接下来三步：' -ForegroundColor Green
Write-Host '    1. 完全退出 DeepSeek Harness'
Write-Host '    2. 重新打开'
Write-Host '    3. 左下角出现一只圆眼睛'
Write-Host ''
Write-Host '    快捷键：'
Write-Host '      Ctrl+Alt+J  换个角落停靠'
Write-Host '      Ctrl+Alt+K  预览“正在思考”的样子'
Write-Host '  ============================================' -ForegroundColor Green
Write-Host ''
Read-Host '  按回车退出' | Out-Null
