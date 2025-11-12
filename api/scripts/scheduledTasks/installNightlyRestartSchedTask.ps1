$TaskName = 'BLT\blt-pm2'
$Description = "Task to restart pm2 for BLT api"
$StartTime = '12:01 AM'
$RepetitionInterval = (New-Timespan -Days 1)
$GMSAAccount = 'aa\gmsa_blt$'

$Action = New-ScheduledTaskAction cmd.exe -argument "/c pm2 kill && D:\public\server\apps\nssm-2.24\nssm.exe restart blt-pm2" -WorkingDirectory "D:\Public\Data\node-ops"
$Trigger = @()
$Trigger += New-ScheduledTaskTrigger -Daily -DaysInterval 1 -At $StartTime
$Trigger += New-ScheduledTaskTrigger -AtStartup
$Principal = New-ScheduledTaskPrincipal -UserID $GMSAAccount -LogonType Password -RunLevel Highest

Register-ScheduledTask $TaskName -Description $Description -Action $Action -Trigger $Trigger -Principal $Principal
#Register-ScheduledTask $TaskName -Action $Action -Trigger $Trigger
#Register-ScheduledTask $TaskName -Action $Action -Principal $Principal
