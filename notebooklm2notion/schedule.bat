@echo off
chcp 65001 > nul
echo [%date% %time%] NotebookLM to Notion 동기화 시작 >> D:\안티그래비티\notebooklm2notion\sync.log
cd /d D:\안티그래비티\notebooklm2notion
node index.js >> D:\안티그래비티\notebooklm2notion\sync.log 2>&1
echo [%date% %time%] 동기화 완료 >> D:\안티그래비티\notebooklm2notion\sync.log
