@echo off
tsc %~dp0griffin.yo.ts -out %~dp0griffin.yo.js
echo ================================
echo TSC.exe version: 
tsc.exe -v
echo ================================
echo If you get a lot of compile errors, make sure that the right tsc.exe is in the path
