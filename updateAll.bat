@echo off
REM Run npm and bower update, and start gulp
REM As they are all commands, I need to call them, otherwise the script will exit automatically after each program.
cd csServerComp
call tsc
cd ../csComp
call npm update
call tsc
cd ../example
call npm update
cd public
call bower update
cd ..
call gulp all
call tsc