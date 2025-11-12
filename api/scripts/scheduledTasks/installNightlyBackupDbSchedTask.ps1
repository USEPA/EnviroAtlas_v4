$TaskName = 'BLT\blt-backupDB'
$Description = "Task to backup BLT postgres DB"
$StartTime = '4:00 AM'
$RepetitionInterval = (New-Timespan -Days 1)
$GMSAAccount = 'aa\gmsa_blt$'

$Action = New-ScheduledTaskAction D:\public\server\apps\nodejs\node.exe -argument "backupDB.js" -WorkingDirectory "D:\public\data\blt\api\scripts"
$Trigger = @()
$Trigger += New-ScheduledTaskTrigger -Daily -DaysInterval 1 -At $StartTime
$Trigger += New-ScheduledTaskTrigger -AtStartup
$Principal = New-ScheduledTaskPrincipal -UserID $GMSAAccount -LogonType Password -RunLevel Highest

Register-ScheduledTask $TaskName -Description $Description -Action $Action -Trigger $Trigger -Principal $Principal
#Register-ScheduledTask $TaskName -Action $Action -Trigger $Trigger
#Register-ScheduledTask $TaskName -Action $Action -Principal $Principal
