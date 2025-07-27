#!/bin/bash
VER=$(date +"%Y.%m.%d.%H%M")
git tag -a v$VER -m "VisionForge Release $VER"
echo "🔖 Tagged version $VER"
