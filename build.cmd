@echo off
pushd "%programfiles(x86)%\Microsoft SDKs\TypeScript\"
FOR /F "delims=" %%I IN ('dir tsc.exe /b /s') DO SET tscBinary=%%I
popd
setlocal enabledelayedexpansion
pushd "src"
FOR /F "delims=" %%I IN ('dir *.ts /b /s') DO (
	if defined copyCmd (
		call SET "copyCmd=!copyCmd! + %%I"
	) else (
		SET copyCmd=copy /y %%I
	)
)
popd
set copyCmd=%copyCmd% bin\Griffin.Yo.ts
"%tscBinary%"
%copyCmd%
echo on
copy /y bin\*.* demos\html\spa\lib\
@endlocal