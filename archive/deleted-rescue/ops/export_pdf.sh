#!/bin/bash
echo "📄 Exporting vibelegal.md to PDF..."
cd content
pandoc vibelegal.md \
  --from markdown \
  --to html5 \
  --css ../style/vision.css \
  -s -o ../dist/vibelegal.html

weasyprint ../dist/vibelegal.html ../dist/vibelegal.pdf
echo "✅ Export complete."
xdg-open ../dist/vibelegal.pdf
