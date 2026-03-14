@echo off
setlocal enabledelayedexpansion

set DIR1=..\..\..\OnnxStack-Private\OnnxStack.Core\bin\x64\Release
set DIR2=..\..\..\OnnxStack-Private\OnnxStack.Device\bin\x64\Release
set DIR3=..\..\..\OnnxStack-Private\OnnxStack.FeatureExtractor\bin\x64\Release
set DIR4=..\..\..\OnnxStack-Private\OnnxStack.ImageUpscaler\bin\x64\Release
set DIR5=..\..\..\OnnxStack-Private\OnnxStack.StableDiffusion\bin\x64\Release

set DEST_DIR=%~dp0

echo Deleting OnnxStack.*.nupkg
del /q "%DEST_DIR%\OnnxStack.*.nupkg"
echo.


echo Copying latest NuGet packages...
echo.

for %%D in ("%DIR1%" "%DIR2%" "%DIR3%" "%DIR4%" "%DIR5%") do (
    if exist %%D (
        pushd %%D

        set LATEST=

        REM Get latest .nupkg by modified date
        for /f "delims=" %%F in ('dir /b /od *.nupkg 2^>nul') do (
            set LATEST=%%F
        )

        if defined LATEST (
            echo Copying !LATEST!
            copy "!LATEST!" "%DEST_DIR%" >nul
        ) else (
            echo No .nupkg files found in %%D
        )

        popd
    ) else (
        echo Folder %%D does not exist.
    )
)

echo.
echo Done.
pause
